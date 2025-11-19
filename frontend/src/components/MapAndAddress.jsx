import React from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { useLanguage } from "./LanguageContext";
const MapAndAddress = () => {
  // 🗺️ Google Maps Embed URL
  const { language } = useLanguage(); 
  const mapEmbedUrl =
    "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3928.1826907435043!2d77.96151347503232!3d10.084112190025559!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTDCsDA1JzAyLjgiTiA3N8KwNTcnNTAuNyJF!5e0!3m2!1sen!2sin!4v1761753848650!5m2!1sen!2sin";

  // 🏠 Address data
  const address = {
   title: language === "EN" ? "📍 Visit Us" : "📍 எங்களை அணுகுங்கள்",
    english: "Bulgishbegam Complex, Main Road, Vadipatti.T - 625218, Tamil Nadu, India.",
    tamil: "புல்கிஷ்பேகம் வளாகம், மெயின் ரோடு, வடிப்பட்டி.டி - 625218, தமிழ்நாடு, இந்தியா.",
    phone: "+91 91506 47008",
    landmarkEnglish: "Near Panchayat Office",
    landmarkTamil: "பஞ்சாயத்து அலுவலகம் அருகில்",
  };

  return (
    <Box
      sx={{
        mt: 4,
        px: { xs: 2, sm: 3, md: 10 },
        fontFamily: `"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif`,
      }}
    >
      <Grid
        container
        spacing={5}
        alignItems="center"
        justifyContent="center"
      >
        {/* 🗺️ MAP SECTION */}
       <Grid size={{ xs: 12, md: 7 }}>{/* increased width for map */}
          <Typography
                      variant="h5"
                      sx={{
                        color: "#7d221d",
                        fontWeight: "bold",
                        mb: 1,
                        fontSize: { xs: "1.2rem", md: "1.8rem" },
                        textAlign: "center",
                      }}
                    >
                      {address.title}
                    </Typography>
          <Box
            component="iframe"
            src={mapEmbedUrl}
            title="Our Location"
            sx={{
              width: "100%",
              height: { xs: 220, sm: 260, md: 350 }, // reduced height
              border: 0,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            allowFullScreen
            loading="lazy"
          />

        </Grid>

        {/* 📍 ADDRESS SECTION */}
       <Grid size={{ xs: 12, md: 5 }}>
          <Stack
            spacing={1.2}
            alignItems={{ xs: "center", md: "flex-start" }}
            justifyContent="center"
            sx={{
              width: "100%",
              height: "100%",
              px: { xs: 0, sm: 2, md: 3 },
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                fontSize: { xs: "1rem", md: "1.1rem" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              {address.english}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.95rem", md: "1rem" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              {address.tamil}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: "#7d221d",
                fontSize: { xs: "1rem", md: "1.1rem" },
                mt: 1,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              📞 {address.phone}
            </Typography>

               {/* 🏁 Landmark */}
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.9rem", md: "1rem" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              📍 <strong>Landmark:</strong> {address.landmarkEnglish} (
              {address.landmarkTamil})
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MapAndAddress;
