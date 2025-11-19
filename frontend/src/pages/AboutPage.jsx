import React from "react";
import Topbar from "../components/Topbar";
import MainNavbar from "../components/MainNavbar";
import CategoryBar from "../components/CategoryBar";
import PhotoAndAddress from "../components/PhotoAndAddress";
import WhyChooseUs from "../components/WhyChooseUs";
import Footer from "../components/Footer";
import { Box, Typography } from "@mui/material";
import { useLanguage } from "../components/LanguageContext";

const tamilFont = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
const englishFont = "'Poppins', 'Lato', sans-serif";

const AboutPage = () => {
  const { language } = useLanguage();

  // Dynamic text based on language
  const bannerTitle = language === "TA" ? "எங்களை பற்றி" : "About Us";
  const bannerDesc =
    language === "TA"
      ? "தரமான இறைச்சியை சுத்தத்துடன் ஒவ்வொரு இல்லத்துக்கும் வழங்குவதே எங்கள் நோக்கம்"
      : "Our mission is to make healthy, high-quality meat accessible to every home — delivered with care, hygiene, and freshness guaranteed.";

  const shopTitle = language === "TA" ? "கடை இருப்பிடம்" : "Our Shop Location";
  const shopDesc =
    language === "TA"
      ? "புதிய கடல் உணவு, தரமான இறைச்சி"
      : "A trusted local destination for the freshest seafood and premium cuts";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: englishFont,
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
          mt: { xs: "92px", sm: "108px", md: "110px" },
          flexGrow: 1,
          backgroundColor: "#fafafa",
        }}
      >
        {/* 👇 Category Bar */}
        <CategoryBar fixed={false} />

        {/* 🏞️ About Us Banner */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: "200px", sm: "300px", md: "350px" },
            overflow: "hidden",
          }}
        >
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

          {/* Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              color: "#ffffff",
              background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
              fontFamily: language === "TA" ? tamilFont : englishFont,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.8rem", md: "2.8rem" },
                mb: 0.5,
                color: "#fff",
              }}
            >
              {bannerTitle}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "0.8rem", md: "1.1rem" },
                maxWidth: { xs: "90%", md: "700px" },
                fontFamily: language === "TA" ? tamilFont : englishFont,
              }}
            >
              {bannerDesc}
            </Typography>
          </Box>
        </Box>

        {/* 🏪 Our Shop Section */}
        <Box
          sx={{
            mt: { xs: "28px", md: "70px" },
            textAlign: "center",
            px: 2,
            mb: { xs: "28px", md: "50px" },
            fontFamily: language === "TA" ? tamilFont : englishFont,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#7d221d",
              fontWeight: "bold",
              fontSize: { xs: "1.6rem", md: "3rem" },
              mb: 0.5,
            }}
          >
            {shopTitle}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#000",
              fontSize: { xs: "0.8rem", md: "1rem" },
              maxWidth: "700px",
              mx: "auto",
            }}
          >
            {shopDesc}
          </Typography>
        </Box>

        {/* 🗺️ Google Map */}
        <Box
          sx={{
            mt: 4,
            mx: { xs: 2, md: 0 },
            borderRadius: { xs: 2, md: 0 },
            overflow: "hidden",
          }}
        >
          <iframe
            title="Shop Location"
            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3928.1826907435043!2d77.96151347503232!3d10.084112190025559!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTDCsDA1JzAyLjgiTiA3N8KwNTcnNTAuNyJF!5e0!3m2!1sen!2sin!4v1761753848650!5m2!1sen!2sin"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </Box>

        {/* 📍 Address + Why Choose Us */}
        <Box sx={{ mx: { xs: 2, md: 6 }, mb: 6 }}>
          <PhotoAndAddress />
          <WhyChooseUs />
        </Box>

        {/* 🦶 Footer */}
        <Box sx={{ mt: "auto" }}>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default AboutPage;
