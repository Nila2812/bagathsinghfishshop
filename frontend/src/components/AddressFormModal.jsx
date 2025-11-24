import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import {
  Box, Button, TextField, Typography, IconButton, Autocomplete, CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { reverseGeocode } from "../utils/geocode";
import { checkDeliveryDistance } from "../utils/distance";
import { getClientId } from "../utils/clientId";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const SHOP_CENTER = [78.15947123056876, 9.919470515872366];

const isValidPincode = (pin) => /^[1-9][0-9]{5}$/.test(pin);
const isValidPhone = (phone) => /^[6-9][0-9]{9}$/.test(phone);

export default function AddressFormModal({ open, onClose, onSaved, defaultValues, isLoggedIn, userId }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const pinnedLocation = useRef({ lat: null, lon: null });

  const [step, setStep] = useState("map");
  const [confirmMode, setConfirmMode] = useState(false);
  const [form, setForm] = useState({
    doorNo: "", street: "", locality: "", landmark: "",
    pincode: "", district: "", state: "", city: "",
    name: "", phone: "", saveAs: "home",
    lat: null, lon: null, fullAddress: ""
  });

  const [searchValue, setSearchValue] = useState("");
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [deliveryCheck, setDeliveryCheck] = useState({ checking: false, deliverable: null, distanceKm: null });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (open) {
      setStep("map");
      setConfirmMode(false);
      setDeliveryCheck({ checking: false, deliverable: null, distanceKm: null });
      if (defaultValues) {
        setForm({ 
          ...defaultValues, 
          saveAs: defaultValues.saveAs || "home",
          name: defaultValues.name || "",
          phone: defaultValues.phone || ""
        });
        pinnedLocation.current = { lat: defaultValues.lat, lon: defaultValues.lon };
      } else {
        setForm({
          doorNo: "", street: "", locality: "", landmark: "",
          pincode: "", district: "", state: "", city: "",
          name: "", phone: "", saveAs: "home",
          lat: null, lon: null, fullAddress: ""
        });
        pinnedLocation.current = { lat: null, lon: null };
      }
      setSearchValue("");
      setError("");
    } else {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    }
  }, [open, defaultValues]);

  useEffect(() => {
    if (!open || !mapRef.current || (isMobile && step !== "map")) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: defaultValues?.lon ? [defaultValues.lon, defaultValues.lat] : SHOP_CENTER,
      zoom: 15,
      dragPan: true,
    });

    map.on("load", () => {
      map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

      if (!defaultValues) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            map.flyTo({ center: [lon, lat], zoom: 15 });
            pinnedLocation.current = { lat, lon };
            await updateAddress(lat, lon);
          },
          () => {},
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        updateAddress(defaultValues.lat, defaultValues.lon);
      }
    });

    map.on("dragend", async () => {
      const center = map.getCenter();
      pinnedLocation.current = { lat: center.lat, lon: center.lng };
      await updateAddress(center.lat, center.lng);
    });

    map.on("zoomend", () => {
      if (pinnedLocation.current.lat && pinnedLocation.current.lon) {
        const currentCenter = map.getCenter();
        const pinLat = pinnedLocation.current.lat;
        const pinLon = pinnedLocation.current.lon;
        
        const threshold = 0.0001;
        if (Math.abs(currentCenter.lat - pinLat) > threshold || 
            Math.abs(currentCenter.lng - pinLon) > threshold) {
          map.setCenter([pinLon, pinLat]);
        }
      }
    });

    mapInstance.current = map;
  }, [open, step, isMobile]);

  const updateAddress = async (lat, lon) => {
    try {
      const geo = await reverseGeocode(lat, lon);
      setForm(f => ({
        ...f, lat, lon,
        fullAddress: geo.place || "",
        locality: geo.place?.split(",")[0] || f.locality,
        pincode: geo.pincode || f.pincode,
        district: geo.district || f.district,
        state: geo.state || f.state,
        city: geo.district || f.city
      }));
    } catch {}
  };

  const handleSearchInput = async (value) => {
    setSearchValue(value);
    if (value.length < 3) {
      setSearchOptions([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${mapboxgl.accessToken}&proximity=${SHOP_CENTER[0]},${SHOP_CENTER[1]}&limit=5`
      );
      const data = await res.json();
      setSearchOptions(data.features.map(f => ({
        label: f.place_name,
        lon: f.center[0],
        lat: f.center[1]
      })));
    } catch {
      setSearchOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSelect = (option) => {
    if (!option) return;
    pinnedLocation.current = { lat: option.lat, lon: option.lon };
    mapInstance.current.flyTo({ center: [option.lon, option.lat], zoom: 15 });
    updateAddress(option.lat, option.lon);
  };

  const centerOnPin = () => {
    if (form.lat && form.lon && mapInstance.current) {
      mapInstance.current.flyTo({ center: [form.lon, form.lat], zoom: 15 });
    }
  };

  const handleContinue = () => {
    if (!form.lat || !form.lon) {
      setError("Please pin your location on the map");
      return;
    }
    
    setConfirmMode(true);
    if (mapInstance.current) {
      mapInstance.current.flyTo({ 
        center: [form.lon, form.lat], 
        zoom: 19,
        duration: 1000 
      });
    }
  };

  const handleConfirmLocation = () => {
    setStep("form");
    setConfirmMode(false);
    setError("");
  };

  const handleBackToSelect = () => {
    setConfirmMode(false);
    if (mapInstance.current) {
      mapInstance.current.flyTo({ 
        center: [form.lon, form.lat], 
        zoom: 15,
        duration: 800
      });
    }
  };

  const saveAddress = async () => {
    setError("");

    // Desktop: Show confirmation zoom before saving
    if (!isMobile && !confirmMode) {
      setConfirmMode(true);
      if (mapInstance.current) {
        mapInstance.current.flyTo({ 
          center: [form.lon, form.lat], 
          zoom: 19,
          duration: 1000 
        });
      }
      return;
    }

    if (!form.doorNo || !form.street || !form.locality || !form.city || 
        !form.pincode || !form.name || !form.phone || !form.lat || !form.lon) {
      setError("Please fill all required fields");
      return;
    }

    if (!isValidPincode(form.pincode)) {
      setError("Invalid 6-digit PIN code");
      return;
    }

    if (!isValidPhone(form.phone)) {
      setError("Invalid phone number. Must be 10 digits starting with 6-9");
      return;
    }

    // Check delivery distance
    setDeliveryCheck({ checking: true, deliverable: null, distanceKm: null });
    const distanceResult = await checkDeliveryDistance(
      SHOP_CENTER[1],
      SHOP_CENTER[0],
      form.lat,
      form.lon,
      3
    );

    setDeliveryCheck({
      checking: false,
      deliverable: distanceResult.deliverable,
      distanceKm: distanceResult.distanceKm
    });

    if (!distanceResult.deliverable) {
      setError(`Sorry, we don't deliver to this location. Please check the pin on the map.`);
      return;
    }

    try {
      // 🔥 Use userId if logged in, otherwise use clientId
      const payload = isLoggedIn 
        ? { userId, ...form }
        : { clientId: getClientId(), ...form };

      const url = defaultValues ? `/api/address/${defaultValues._id}` : "/api/address";
      const method = defaultValues ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save address");
      }

      const saved = await res.json();
      onSaved?.(saved);
      onClose?.();
    } catch (e) {
      setError(e.message || "Failed to save address");
    }
  };

  if (!open) return null;

  const renderMapView = () => (
    <Box sx={{ 
      position: "relative", 
      width: "100%", 
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <Box 
        ref={mapRef} 
        sx={{ 
          width: "100%", 
          flex: 1,
          minHeight: 0
        }} 
      />

      {/* FIXED CENTER PIN */}
      <Box sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -100%)",
        zIndex: 3,
        pointerEvents: "none"
      }}>
        <Box component="span" sx={{ display: 'block', width: 30, height: 43 }}>
          <svg width="30" height="43" viewBox="0 0 30 43" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 28 15 28s15-17.5 15-28c0-8.284-6.716-15-15-15z" fill="#D31032"/>
            <circle cx="15" cy="15" r="6" fill="white"/>
          </svg>
        </Box>
      </Box>

      {/* Search Bar Overlay */}
      <Box sx={{
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 2
      }}>
        <Autocomplete
          freeSolo
          options={searchOptions}
          loading={searchLoading}
          inputValue={searchValue}
          onInputChange={(e, val) => handleSearchInput(val)}
          onChange={(e, val) => handleSearchSelect(val)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search for Area/Locality"
              size="small"
              sx={{ bgcolor: "white" }}
              InputProps={{
                ...params.InputProps,
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#999" }} />,
                endAdornment: searchLoading ? <CircularProgress size={20} /> : null
              }}
            />
          )}
        />
      </Box>

      {/* Current Location Button */}
      <IconButton
        onClick={centerOnPin}
        sx={{
          position: "absolute",
          bottom: isMobile ? (confirmMode ? 130 : 180) : 20,
          right: 20,
          bgcolor: "#fff",
          boxShadow: 2,
          "&:hover": { bgcolor: "#f5f5f5" },
          zIndex: 2
        }}
      >
        <MyLocationIcon />
      </IconButton>

      {/* Fetched Location Display */}
      {!confirmMode && (
        <Box sx={{
          bgcolor: "white",
          p: 2,
          borderTop: "1px solid #e0e0e0",
          maxHeight: isMobile ? "120px" : "80px",
          overflowY: "auto"
        }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <LocationOnIcon sx={{ color: "#D31032", fontSize: 20, mt: 0.3 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Selected Location
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.4 }}>
                {form.fullAddress || "Move the map to select a location"}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Continue Button for Mobile */}
      {isMobile && (
        <Box sx={{
          p: confirmMode ? 1.5 : 2,
          bgcolor: "white",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)"
        }}>
          {!confirmMode ? (
            <>
              <Button
                variant="contained"
                fullWidth
                onClick={handleContinue}
                disabled={!form.lat || !form.lon}
                sx={{
                  bgcolor: "#D31032",
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#b00" },
                  "&:disabled": { bgcolor: "#ccc" }
                }}
              >
                Continue
              </Button>
              {error && (
                <Typography variant="caption" sx={{ color: "error.main", display: "block", mt: 1 }}>
                  {error}
                </Typography>
              )}
            </>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ 
                bgcolor: "#fff8f8", 
                border: "1px solid #ffe0e0",
                borderRadius: 1,
                p: 1.5,
                mb: 0.5
              }}>
                <Typography variant="body2" sx={{ color: "#D31032", fontWeight: 600, textAlign: "center", mb: 0.5 }}>
                  ✓ Is this your exact delivery location?
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", display: "block" }}>
                  Drag map to adjust if needed
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleBackToSelect}
                  sx={{
                    flex: 1,
                    py: 1.2,
                    color: "#D31032",
                    borderColor: "#D31032",
                    "&:hover": { borderColor: "#b00", bgcolor: "#fff8f8" }
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleConfirmLocation}
                  sx={{
                    flex: 1,
                    py: 1.2,
                    bgcolor: "#D31032",
                    "&:hover": { bgcolor: "#b00" }
                  }}
                >
                  Confirm
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );

  const renderFormView = () => (
    <Box sx={{
      p: 3,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 2.5,
      height: "100%"
    }}>
      <TextField
        label="Door No / Flat No *"
        value={form.doorNo}
        onChange={(e) => setForm(f => ({ ...f, doorNo: e.target.value }))}
        fullWidth
        size="small"
      />

      <TextField
        label="Street Name *"
        value={form.street}
        onChange={(e) => setForm(f => ({ ...f, street: e.target.value }))}
        fullWidth
        size="small"
      />

      <TextField
        label="Locality *"
        value={form.locality}
        onChange={(e) => setForm(f => ({ ...f, locality: e.target.value }))}
        fullWidth
        size="small"
      />

      <TextField
        label="Landmark (Optional)"
        value={form.landmark}
        onChange={(e) => setForm(f => ({ ...f, landmark: e.target.value }))}
        fullWidth
        size="small"
      />

      <TextField
        label="City *"
        value={form.city}
        onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
        fullWidth
        size="small"
      />

      <TextField
        label="Pincode *"
        value={form.pincode}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
          setForm(f => ({ ...f, pincode: val }));
        }}
        fullWidth
        size="small"
        inputProps={{ maxLength: 6 }}
      />

      <TextField
        label="Your Name *"
        value={form.name}
        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
        fullWidth
        size="small"
      />

      <TextField
        label="Phone Number *"
        value={form.phone}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
          setForm(f => ({ ...f, phone: val }));
        }}
        fullWidth
        size="small"
        inputProps={{ maxLength: 10 }}
        helperText="10 digits starting with 6-9"
      />

      <Box>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
          Save As *
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {["home", "work", "other"].map(type => (
            <Button
              key={type}
              variant={form.saveAs === type ? "contained" : "outlined"}
              onClick={() => setForm(f => ({ ...f, saveAs: type }))}
              sx={{
                flex: 1,
                textTransform: "capitalize",
                ...(form.saveAs === type && {
                  bgcolor: "#D31032",
                  "&:hover": { bgcolor: "#b00" }
                })
              }}
            >
              {type}
            </Button>
          ))}
        </Box>
      </Box>

      {error && (
        <Typography variant="body2" sx={{ color: "error.main" }}>
          {error}
        </Typography>
      )}

      {!confirmMode ? (
        <Button
          variant="contained"
          fullWidth
          onClick={saveAddress}
          disabled={deliveryCheck.checking}
          sx={{
            bgcolor: "#D31032",
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            "&:hover": { bgcolor: "#b00" },
            "&:disabled": { bgcolor: "#ccc" }
          }}
        >
          {deliveryCheck.checking ? "Checking delivery..." : "Save Address"}
        </Button>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ 
            bgcolor: "#fff8f8", 
            border: "1px solid #ffe0e0",
            borderRadius: 1,
            p: 1.5,
            mb: 0.5
          }}>
            <Typography variant="body2" sx={{ color: "#D31032", fontWeight: 600, textAlign: "center", mb: 0.5 }}>
              ✓ Is this your exact delivery location?
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "center", display: "block" }}>
              Drag map to adjust if needed
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleBackToSelect}
              sx={{
                flex: 1,
                color: "#D31032",
                borderColor: "#D31032",
                "&:hover": { borderColor: "#b00", bgcolor: "#fff8f8" }
              }}
            >
              Adjust Pin
            </Button>
            <Button
              variant="contained"
              onClick={saveAddress}
              disabled={deliveryCheck.checking}
              sx={{
                flex: 1,
                bgcolor: "#D31032",
                "&:hover": { bgcolor: "#b00" },
                "&:disabled": { bgcolor: "#ccc" }
              }}
            >
              {deliveryCheck.checking ? "Checking..." : "Confirm & Save"}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{
      position: "fixed",
      inset: 0,
      bgcolor: "rgba(0,0,0,0.5)",
      zIndex: 1300,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Box sx={{
        width: { xs: "100%", md: "90%" },
        maxWidth: { xs: "100%", md: 1200 },
        height: { xs: "100%", md: "90vh" },
        bgcolor: "#fff",
        borderRadius: { xs: 0, md: 2 },
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #e0e0e0"
        }}>
          {isMobile && step === "form" && (
            <IconButton onClick={() => setStep("map")}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {defaultValues ? "Edit Address" : "Add New Address"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Instruction note below header */}
        <Box sx={{ px: 2, py: 1, bgcolor: "#fff8f8", borderBottom: "1px solid #ffe0e0" }}>
          <Typography variant="body2" sx={{ color: "#D31032", fontWeight: 500 }}>
            📍 Pin exact location on the map - We deliver within 3km radius
          </Typography>
        </Box>

        {/* Content */}
        {isMobile ? (
          <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {step === "map" ? renderMapView() : renderFormView()}
          </Box>
        ) : (
          <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <Box sx={{ flex: "0 0 55%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {renderMapView()}
            </Box>
            <Box sx={{ flex: "0 0 45%", overflowY: "auto" }}>
              {renderFormView()}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}