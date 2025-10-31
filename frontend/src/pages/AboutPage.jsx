import React from "react";
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/Categorybar";
import PhotoAndAddress from "../components/PhotoAndAddress";
import WhyChooseUs from "../components/WhyChooseUs";
import Footer from "../components/Footer";
import { Box, Typography } from "@mui/material";

const AboutPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: `"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif`,
      }}
    >
      {/* 🧭 Fixed Header (Topbar + MainNavbar only) */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "#fff",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <Topbar />
        <MainNavbar />
      </Box>

      {/* 📜 Scrollable Content */}
      <Box
        sx={{
          mt: { xs: "150px", md: "100px" },
          px: 0,
          pb: 0,
          overflowY: "auto",
          flexGrow: 1,
          backgroundColor: "#fafafa",
        }}
      >
        {/* 👇 Category Bar (scrolls with the page) */}
        <Box sx={{ zIndex: 1 }}>
          <CategoryBar fixed={false} />
        </Box>

        {/* 🏞️ About Us Banner Section */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: "250px", md: "350px" },
            borderRadius: { xs: 0, md: 0 },
            overflow: "hidden",
          }}
        >
          {/* Background Image */}
          <Box
            component="img"
            src="src/img/about.png"
            alt="About Us Banner"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(70%)",
            }}
          />

          {/* Overlay Text */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              color: "#ffffff",
              px: 2,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.8rem", md: "2.8rem" },
                color: "#fff",
              }}
            >
              About Us
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 1,
                fontSize: { xs: "0.7rem", md: "1.1rem" },
                maxWidth: { xs: "90%", md: "700px" },
              }}
            >
              Our mission is to make healthy, high-quality meat accessible to every home —
               delivered with care, hygiene, and freshness guaranteed.
            </Typography>
          </Box>
        </Box>
        {/* 🏪 Our Store Section */}
        <Box
          sx={{
            mt: {xs: "28px", md: "70px"}, // small space after banner
            textAlign: "center",
            px: 2,
            mb: {xs: "28px", md: "50px"}
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#7d221d",
              fontWeight: "bold",
              fontSize: { xs: "1.6rem", md: "3rem" },
              mb: 0.5, // minimal spacing before description

              textTransform: "CamelCase",
            }}
          >
            Our Shop Location
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#000",
              fontSize: { xs: "0.7rem", md: "1rem" },
              maxWidth: "700px",
              mx: "auto",
              lineHeight: {xs:1, md:0},
            }}
          >
            A trusted local destination for the freshest seafood and premium cuts
          </Typography>
        </Box>


        {/* 🗺️ Full-width Map Section */}
        <Box
          sx={{
            mt: 4,
            ml:3,
            mr:3,
            width: { xs: "calc(100% - 24px)", md: "100%" }, // full width on laptop, margin on mobile
            mx: { xs: "auto", md: 0 },
            borderRadius: { xs: 2, md: 0 },
            overflow: "hidden",
          }}
        >
          <iframe
            title="Shop Location"
            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3928.1826907435043!2d77.96151347503232!3d10.084112190025559!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTDCsDA1JzAyLjgiTiA3N8KwNTcnNTAuNyJF!5e0!3m2!1sen!2sin!4v1761753848650!5m2!1sen!2sin"
            width="100%"
            height="350"
            style={{
              border: 0,
              display: "block",
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </Box>
        {/* 🏠 Photo and Address Section */}
<Box
  sx={{
    mx: { xs: 2, md: 6 },
    mb: 6,
  }}
>
  <PhotoAndAddress />
  <WhyChooseUs />
   
</Box>
<Box sx={{ mt: "auto" , mb:0}}>

  <Footer />
</Box>
 
      </Box>
    </Box>
  );
};

export default AboutPage;
