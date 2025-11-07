import React from "react";
import { Box } from "@mui/material";
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import HomeBanner from "../components/HomeBanner";
import HomeCategorySection from "../components/HomeCategorySection";

const HomePage = () => {
  return (
    <>
      <Topbar />
      <MainNavbar fixed/>
      <CategoryBar fixed />

      <Box
        sx={{
          mt: { xs: "210px", md: "150px" },
          px: 0,
          pb: 4,
          position: "relative",
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
          <HomeCategorySection />
      </Box>
    </>
  );
};

export default HomePage;
