import React from "react";
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import ContactsBox from "../components/ContactsBox";
import MapAndAddress from "../components/MapAndAddress";
import Footer from "../components/Footer";
import { Box, Typography } from "@mui/material";

const ContactPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: `"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif`,
      }}
    >
      {/* 🧭 Fixed Header */}
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
      <MainNavbar fixed />

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
        {/* 👇 Category Bar (scrolls with page) */}
        <Box sx={{ zIndex: 1 }}>
          <CategoryBar fixed={false} />
        </Box>

        {/* 📞 Contact Banner */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: "250px", md: "350px" },
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src="src/img/contact.png"
            alt="Contact Us Banner"
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
              color: "#fff",
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5))",
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
              Contact Us
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 1,
               fontSize: {
                  xs: "0.65rem",   // for small screens (mobile, like iPhone SE)
                  sm: "0.8rem",    // for slightly larger phones
                  md: "1.1rem",    // for tablets and small laptops
                  lg: "1.3rem",    // for desktops
                },

                maxWidth: { xs: "90%", md: "700px" },
              }}
            >
              We’re here to help! Reach out for any inquiries, feedback, or
              support — we’d love to hear from you.
            </Typography>
          </Box>
        </Box>

        {/* 📞 Contact Options */}
        <Box sx={{ mx: { xs: 2, md: 6 }, my: {xs:6, md:13} }}>
          <ContactsBox />
        </Box>
        <Box sx={{ mx: { xs: 2, md: 6 }, my: {xs:6, md:13} }}>
          <MapAndAddress />
        </Box>
        <Box sx={{ mt: "auto" , mb:0}}>
      <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default ContactPage;
