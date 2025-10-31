import React from "react";
import { Box, Typography } from "@mui/material";

const PhotoAndAddress = () => {
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
        fontFamily: `"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif`,
        mt: 8,
      }}
    >
      {/* 🖼️ Left - Shop Image */}
      <Box
        component="img"
        src="src/img/shop.jpg" // replace with your shop image
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
          //p: { xs: 0, md: 4 },
          pt: { xs: 2, md: 2 },
          pb: { xs: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems:{ xs: "center", md: "center" },
          backgroundColor: "#fafafa",
        }}
      >
        {/* Tamil Address */}
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
            mb: 2,
            lineHeight: 1.6,

            fontSize: { xs: "0.90rem", md: "1rem" },
          }}
        >
          எண் 45, கோவில் தெரு,  
          <br />
          தேனி - 625531, தமிழ்நாடு.
        </Typography>

        {/* English Address */}
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
            mb: 2,
            lineHeight: 1.6,
            fontSize: { xs: "0.90rem", md: "1rem" },
          }}
        >
          No. 45, Kovil Street,  
          <br />
          Theni - 625531, Tamil Nadu, India.
        </Typography>

        {/* Landmark */}
        <Typography
          variant="subtitle1"
          sx={{
            color: "#7d221d",
            fontWeight: "bold",
            mb: 0.5,
            fontSize: { xs: "1.1rem", md: "1.3rem" },
          }}
        >
          🏠 Landmark
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#000",
            mb: 2,
            lineHeight: 1.6,
            fontSize: { xs: "0.90rem", md: "1rem" },
          }}
        >
          Near Sri Mariamman Temple
        </Typography>

        {/* Followers / Tagline */}
        <Typography
          variant="subtitle2"
          sx={{
            color: "#7d221d",
            fontWeight: "bold",
            mt: 1,
            fontSize: { xs: "0.90rem", md: "1rem" },
          }}
        >
          ❤️ Trusted by hundreds of happy customers!
        </Typography>
      </Box>
    </Box>
  );
};

export default PhotoAndAddress;
