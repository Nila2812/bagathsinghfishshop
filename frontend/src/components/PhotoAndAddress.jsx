import React from "react";
import { Box, Typography } from "@mui/material";

const PhotoAndAddress = () => {
  const tamilFont = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
  const englishFont = "'Poppins', 'Lato', sans-serif";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "stretch",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: "#ffffffe6",
        boxShadow: "0 0 6px rgba(0,0,0,0.15), 0 0 15px rgba(0,0,0,0.1)",
        borderRadius: "16px",
        overflow: "hidden",
        mt: 8,
      }}
    >
      {/* 🖼️ Left - Shop Image */}
      <Box
        component="img"
        src="src/img/shop.jpg"
        alt="Our Shop"
        sx={{
          width: { xs: "100%", md: "50%" },
          height: { xs: "250px", md: "100%" },
          objectFit: "cover",
        }}
      />

      {/* 📍 Right - Address Details */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          pt: { xs: 2, md: 3 },
          pb: { xs: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fafafa",
          textAlign: "center",
        }}
      >
        {/* Tamil Section */}
        <Box sx={{ mb: 3, fontFamily: tamilFont }}>
          <Typography
            variant="h6"
            sx={{
              color: "#7d221d",
              fontWeight: "bold",
              mb: 1,
              fontSize: { xs: "1.1rem", md: "1.3rem" },
            }}
          >
            📍 எங்கள் கடை முகவரி
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#000",
              mb: 1,
              lineHeight: 1.6,
              fontSize: { xs: "0.85rem", md: "0.95rem" },
            }}
          >
            புல்கிஷ்பேகம் வளாகம், மெயின் ரோடு
            <br />
            வடிப்பட்டி.டி - 625218, தமிழ்நாடு, இந்தியா.
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              color: "#7d221d",
              fontWeight: "bold",
              mt: 1,
              fontSize: { xs: "1rem", md: "1.1rem" },
            }}
          >
            🏠 முக்கிய அடையாளம்
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#000",
              lineHeight: 1.6,
              fontSize: { xs: "0.85rem", md: "0.95rem" },
            }}
          >
            பஞ்சாயத்து அலுவலகம் அருகில்
          </Typography>
        </Box>

        {/* English Section */}
        <Box sx={{ fontFamily: englishFont }}>
          <Typography
            variant="h6"
            sx={{
              color: "#7d221d",
              fontWeight: "bold",
              mb: 1,
              fontSize: { xs: "1.1rem", md: "1.3rem" },
            }}
          >
            📍 Our Shop Address
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#000",
              mb: 1,
              lineHeight: 1.6,
              fontSize: { xs: "0.9rem", md: "1rem" },
            }}
          >
            Bulgishbegam Complex, Main road
            <br />
            Vadipatti.T - 625218, Tamil Nadu, India.
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              color: "#7d221d",
              fontWeight: "bold",
              mt: 1,
              fontSize: { xs: "1rem", md: "1.1rem" },
            }}
          >
            🏠 Landmark
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#000",
              lineHeight: 1.6,
              fontSize: { xs: "0.85rem", md: "0.95rem" },
            }}
          >
            Near Panchayat Office
          </Typography>
        </Box>

        {/* Tagline */}
        <Typography
          variant="subtitle2"
          sx={{
            color: "#7d221d",
            fontWeight: "bold",
            mt: 3,
            fontFamily: englishFont,
            fontSize: { xs: "0.9rem", md: "1rem" },
          }}
        >
          ❤️ Trusted by hundreds of happy customers!
        </Typography>
      </Box>
    </Box>
  );
};

export default PhotoAndAddress;
