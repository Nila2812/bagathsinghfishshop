// src/components/SelectAddressModal.jsx
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Box, Button } from "@mui/material";
import "mapbox-gl/dist/mapbox-gl.css";


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
console.log("Mapbox token:", mapboxgl.accessToken);

// Shop center (lng, lat). Replace with your exact shop coords.
const SHOP_CENTER = [78.15947123056876, 9.919470515872366];
export default function SelectAddressModal({ open, onClose, onConfirm }) {
  const containerRef = useRef(null);
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: SHOP_CENTER,
      zoom: 13
    });

    let marker;
    const setMarker = (lngLat) => {
      if (marker) marker.remove();
      marker = new mapboxgl.Marker().setLngLat(lngLat).addTo(map);
      setPicked({ lat: lngLat.lat, lon: lngLat.lng });
    };

    // Click to pick
    map.on("click", (e) => setMarker(e.lngLat));

    // Current location control
    map.addControl(new mapboxgl.GeolocateControl({ trackUserLocation: false }));

    return () => map.remove();
  }, [open]);

  return !open ? null : (
    <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,0.4)", zIndex: 1300 }}>
      <Box sx={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 600, maxWidth: "95%", bgcolor: "#fff", p: 2, borderRadius: 2
      }}>
        <Box ref={containerRef} sx={{ height: 420, border: "1px solid #ddd", borderRadius: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button
            onClick={() => picked && onConfirm(picked)}
            variant="contained"
            disabled={!picked}
          >
            Confirm location
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
