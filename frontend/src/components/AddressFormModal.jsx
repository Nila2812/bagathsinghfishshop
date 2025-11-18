import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import {
  Box, Button, TextField, Typography, IconButton, Autocomplete, CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { reverseGeocode } from "../utils/geocode";
import { getClientId } from "../utils/clientId";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const SHOP_CENTER = [78.15947123056876, 9.919470515872366];

const isValidPincode = (pin) => /^[1-9][0-9]{5}$/.test(pin);
const isValidPhone = (phone) => /^[6-9][0-9]{9}$/.test(phone);

async function verifyPincode(pin) {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();
    return data[0]?.Status === "Success";
  } catch {
    return false;
  }
}

export default function AddressFormModal({ open, onClose, onSaved, defaultValues }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // removed markerRef because pin is fixed in center overlay

  const [step, setStep] = useState("map"); // "map" or "form"
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (open) {
      setStep("map");
      if (defaultValues) {
        setForm({ 
          ...defaultValues, 
          saveAs: defaultValues.saveAs || "home",
          name: defaultValues.name || "",
          phone: defaultValues.phone || ""
        });
      } else {
        setForm({
          doorNo: "", street: "", locality: "", landmark: "",
          pincode: "", district: "", state: "", city: "",
          name: "", phone: "", saveAs: "home",
          lat: null, lon: null, fullAddress: ""
        });
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
      dragPan: true
    });

    map.on("load", () => {
      map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

      if (!defaultValues) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            map.flyTo({ center: [lon, lat], zoom: 15 });
            await updateAddress(lat, lon);
          },
          () => {},
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        // center is already set via initial map center; make sure address is updated
        updateAddress(defaultValues.lat, defaultValues.lon);
      }
    });

    // When dragging ends, use map center to update address (fixed-center pin behavior)
    map.on("dragend", async () => {
      const center = map.getCenter();
      await updateAddress(center.lat, center.lng);
    });

    mapInstance.current = map;
  }, [open, step, isMobile]);

  // placeMarker removed - using fixed overlay pin instead

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
    setStep("form");
    setError("");
  };

  const saveAddress = async () => {
    setError("");

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

    const exists = await verifyPincode(form.pincode);
    if (!exists) {
      setError("PIN code does not exist in India Post records");
      return;
    }

    try {
      const clientId = getClientId();
      const payload = { clientId, ...form };
      const url = defaultValues ? `/api/address/${defaultValues._id}` : "/api/address";
      const method = defaultValues ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save");
      const saved = await res.json();
      onSaved?.(saved);
      onClose?.();
    } catch (e) {
      setError(e.message || "Failed to save address");
    }
  };

  if (!open) return null;

  const renderMapView = () => (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <Box ref={mapRef} sx={{ width: "100%", height: "100%" }} />

      {/* FIXED CENTER PIN (Rapido/Ola/Uber style) */}
      <Box sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -100%)",
        zIndex: 3,
        pointerEvents: "none"
      }}>
        {/* Inline SVG pin keeps this component self-contained */}
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
          bottom: 100,
          right: 20,
          bgcolor: "#fff",
          boxShadow: 2,
          "&:hover": { bgcolor: "#f5f5f5" },
          zIndex: 2
        }}
      >
        <MyLocationIcon />
      </IconButton>

      {/* Continue Button for Mobile */}
      {isMobile && (
        <Box sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: "white",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          zIndex: 2
        }}>
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
              "&:hover": { bgcolor: "b00" }
            }}
          >
            Continue
          </Button>
          {error && (
            <Typography variant="caption" sx={{ color: "error.main", display: "block", mt: 1 }}>
              {error}
            </Typography>
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
                  "&:hover": { bgcolor: "b00" }
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

      <Button
        variant="contained"
        fullWidth
        onClick={saveAddress}
        sx={{
          bgcolor: "#D31032",
          py: 1.5,
          fontSize: "1rem",
          fontWeight: 600,
          "&:hover": { bgcolor: "b00" }
        }}
      >
        Save Address
      </Button>
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

        {/* Small note below header */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" sx={{   color: "red",
    fontStyle: "bold",
    fontWeight: 400, }}>
            Pin exact location in the map-"Your Order will be deliverd here"
          </Typography>
        </Box>

        {/* Content */}
        {isMobile ? (
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            {step === "map" ? renderMapView() : renderFormView()}
          </Box>
        ) : (
          <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <Box sx={{ flex: "0 0 55%", position: "relative" }}>
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
