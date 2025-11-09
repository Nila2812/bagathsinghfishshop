import React from "react";
import { Box } from "@mui/material";
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import HomeBanner from "../components/HomeBanner";
import FAQSection from "../components/FAQSection";
import HowItWorks from "../components/HowItWorksSection";
import HomeCategorySection from "../components/HomeCategorySection";
import Footer from "../components/Footer";
import CategoryCarousel from "../components/CategoryCarousel";
import OfferCarousel from "../components/OfferCarousel";

const HomePage = () => {
  return (
    <>
      {/* 🔹 Fixed Header Wrapper */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1200,
          backgroundColor: "#fff",
          boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Topbar />
        <MainNavbar />
        <CategoryBar />
      </Box>

      {/* 🔹 Main Content Section */}
      <Box
        sx={{
          mt: { xs: "180px", md: "150px" }, // Adjust this based on combined header height
          px: 0,
          position: "relative",
          backgroundColor: "#fafafa",
        }}
      >
        <HomeBanner />
        <OfferCarousel />
        <CategoryCarousel />
        <HowItWorks />
        <HomeCategorySection />
        <FAQSection />
        <Footer />
      </Box>
    </>
  );
};

export default HomePage;
