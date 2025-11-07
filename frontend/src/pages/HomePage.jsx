import React from "react";
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import HomeBanner from "../components/HomeBanner";
import { Box } from "@mui/material";

const HomePage = () => {
  return (
    <>
      {/* Fixed sections */}
      <Topbar />
      <MainNavbar />
      <CategoryBar fixed={true} />

      {/* Scrollable main content */}
      <Box
        sx={{
          mt: { xs: "220px", md: "150px" }, // enough space below fixed bars
          px: 0,
          pb: 4,
          minHeight: "200vh", // ensures scroll
          position: "relative", // keeps content flow correct
        }}
      >
        <HomeBanner
          offer={{
            product: "Sea Fish Combo",
            discount: 25,
            originalPrice: 800,
            discountedPrice: 600,
          }}
        />

      
      </Box>
    </>
  );
};

export default HomePage;
