import React from "react";
import { Box } from "@mui/material";
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import HomeBanner from "../components/HomeBanner";
import FAQSection from "../components/FAQSection";
import HowItWorks from "../components/HowItWorksSection";
//import HomeCategorySection from "../components/HomeCategorySection";
import Footer from "../components/Footer";
import CategoryCarousel from "../components/CategoryCarousel";

const HomePage = () => {
  return (
    <>
      <Topbar />
      <MainNavbar fixed/>
      <CategoryBar fixed />

      <Box
        sx={{
          mt: { xs: "200px", md: "150px" },
          px: 0,
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
          {/* <HomeCategorySection /> */}
        <CategoryCarousel />
        <HowItWorks />
        <FAQSection  />
        <Footer />
      </Box>
    </>
  );
};

export default HomePage;
