import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { useLanguage } from "./LanguageContext"; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const tamilFont = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
const englishFont = "'Poppins', 'Lato', sans-serif";

const HomeBanner = () => {
  const { language } = useLanguage(); 
  const navigate = useNavigate(); 

  const bannerImages = [
    "src/img/Home2.png",
    "src/img/Home1.png",
    "src/img/Home3.png",
    "src/img/Home4.jpg",
    "src/img/Home5.png",
    "src/img/Home6.png",
  ];

  // ✨ Language-specific text
  const textContent = {
    EN: {
      title: "“Fresh Meat, Juicy Chicken & Daily Catch Fish – All in One Place!”",
      subtitle: "Bringing the taste of freshness from our shop to your kitchen.",
      explore: "Explore",
      contact: "Contact Us",
    },
    TA: {
      title: "“இறைச்சி, கோழி, கடல் உணவு — ஒரே இடத்தில்!”",
      subtitle: "எங்கள் கடையிலிருந்து பசுமை உங்கள் வீடு வரை!",
      explore: "ஆராய்க",
      contact: "தொடர்பு கொள்ள",
    },
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    appendDots: (dots) => (
      <Box
        sx={{
          position: "absolute",
          bottom: "10px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <ul style={{ margin: 0, padding: 0 }}>{dots}</ul>
      </Box>
    ),
    customPaging: () => (
      <div
        style={{
          width: "9px",
          height: "9px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.7)",
          transition: "all 0.3s ease",
        }}
      ></div>
    ),
  };

  return (
    <Box
      sx={{
        mb: 6,
        width: "100%",
        height: { xs: "235px", sm: "300px", md: "400px" },
        position: "relative",
        overflow: "hidden",
        fontFamily: language === "EN" ? englishFont : tamilFont,
      }}
    >
      {/* 🎨 Custom Dots Style */}
      <style>
        {`
          .slick-dots li {
            margin: 0 5px;
          }
          .slick-dots li.slick-active div {
            background: #cc1d2e !important;
            transform: scale(1.4);
            box-shadow: 0 0 6px rgba(204, 29, 46, 0.6);
          }
          .slick-dots li div:hover {
            transform: scale(1.3);
            background: rgba(204, 29, 46, 0.8);
          }
        `}
      </style>

      <Slider {...sliderSettings}>
        {bannerImages.map((image, index) => (
          <Box
            key={index}
            sx={{
              height: { xs: "235px", sm: "300px", md: "400px" },
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            {/* Overlay with Text */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                px: { xs: 2, sm: 3, md: 4 },
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  maxWidth: "600px",
                  mx: "auto",
                  px: { xs: 1, sm: 2 },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    color: "#fff",
                    textShadow: "0 2px 5px rgba(0,0,0,0.6)",
                    fontSize: { xs: "0.9rem", sm: "1.2rem", md: "1.5rem" },
                    fontFamily: language === "EN" ? englishFont : tamilFont,
                  }}
                >
                  {textContent[language].title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "#fff",
                    mt: 1,
                    opacity: 0.9,
                    fontSize: { xs: "0.75rem", sm: "0.9rem", md: "1rem" },
                    fontFamily: language === "EN" ? englishFont : tamilFont,
                  }}
                >
                  {textContent[language].subtitle}
                </Typography>

                <Box
                  sx={{
                    mt: { xs: 2, sm: 3 },
                    display: "flex",
                    gap: { xs: 1.5, sm: 2 },
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    variant="contained"
                      onClick={() => navigate("/products")}
                    sx={{
                      backgroundColor: "#cc1d2e",
                      color: "white",
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.5, sm: 0.8 },
                      fontWeight: "bold",
                      fontSize: { xs: "0.7rem", sm: "0.9rem" },
                      whiteSpace: "nowrap",
                      "&:hover": {
                        backgroundColor: "#a81825",
                      },
                    }}
                  >
                    {textContent[language].explore}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => navigate("/contact")} // ✅ Navigation
                    sx={{
                      borderColor: "white",
                      color: "white",
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.5, sm: 0.8 },
                      borderRadius: "20px",
                      fontWeight: "bold",
                      fontSize: { xs: "0.7rem", sm: "0.9rem" },
                      whiteSpace: "nowrap",
                      "&:hover": {
                        backgroundColor: "white",
                        color: "#cc1d2e",
                      },
                    }}
                  >
                    {textContent[language].contact}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default HomeBanner;
