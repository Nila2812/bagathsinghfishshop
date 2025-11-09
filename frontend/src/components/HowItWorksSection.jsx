import React, { useState } from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  Button,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const HowItWorksSection = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [language, setLanguage] = useState("en"); // 'en' or 'ta'

  const tamilFontFamily = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
  const englishFontFamily = "'Poppins', 'Lato', 'Helvetica Neue', sans-serif";

  const steps = {
    en: [
      {
        icon: <ShoppingCartIcon sx={{ fontSize: 50, color: "#7D221D" }} />,
        title: "Choose Products",
        desc: "Select from our wide range of fresh chicken, fish, and quail products.",
      },
      {
        icon: <LocalDiningIcon sx={{ fontSize: 50, color: "#d2691e" }} />,
        title: "Processed Freshly",
        desc: "Your order is cleaned, cut, and prepared fresh by our expert team.",
      },
      {
        icon: <LocalShippingIcon sx={{ fontSize: 50, color: "#f4a300" }} />,
        title: "Doorstep Delivery",
        desc: "We deliver your order quickly to your doorstep, fresh and chilled.",
      },
    ],
    ta: [
      {
        icon: <ShoppingCartIcon sx={{ fontSize: 50, color: "#7D221D" }} />,
        title: "தயாரிப்புகளைத் தேர்ந்தெடுக்கவும்",
        desc: "புதிய கோழி, மீன் மற்றும் காடை தயாரிப்புகளில் இருந்து தேர்ந்தெடுக்கவும்.",
      },
      {
        icon: <LocalDiningIcon sx={{ fontSize: 50, color: "#d2691e" }} />,
        title: "புதியதாக தயாரிக்கப்படுகிறது",
        desc: "உங்கள் ஆர்டர் சுத்தப்படுத்தப்பட்டு, வெட்டப்பட்டு, எங்கள் நிபுணர்களால் தயாரிக்கப்படுகிறது.",
      },
      {
        icon: <LocalShippingIcon sx={{ fontSize: 50, color: "#f4a300" }} />,
        title: "வீட்டுக்கு நேரடி விநியோகம்",
        desc: "நாங்கள் உங்கள் ஆர்டரை பசுமையாகவும் குளிர்ச்சியுடனும் விரைவாக விநியோகிக்கிறோம்.",
      },
    ],
  };

  const currentSteps = steps[language];

  return (
    <Box
      sx={{
        py: 8,
        px: { xs: 2, sm: 4, md: 8 },
        textAlign: "center",
        background: "linear-gradient(180deg, #fff9f9 0%, #fff 100%)",
        fontFamily: language === "ta" ? tamilFontFamily : englishFontFamily,
        position: "relative",
      }}
    >
      {/* Language Switcher */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          onClick={() => setLanguage(language === "en" ? "ta" : "en")}
          variant="outlined"
          sx={{
            borderColor: "#7D221D",
            color: "#7D221D",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#7D221D",
              color: "#fff",
            },
          }}
        >
          {language === "en" ? "தமிழ்" : "English"}
        </Button>
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 6,
          color: "#3b1f1d",
          letterSpacing: 1,
        }}
      >
        {language === "en" ? "HOW IT WORKS" : "எப்படி செயல்படுகிறது"}
      </Typography>

      {/* Steps Container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "center",
          gap: { xs: 5, md: 8 },
          position: "relative",
        }}
      >
        {currentSteps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step Card */}
            <Box
              sx={{
                backgroundColor: "#fff",
                boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
                borderRadius: "20px",
                p: 4,
                width: { xs: "90%", sm: "80%", md: 280 },
                height: { xs: "auto", md: 250 },
                textAlign: "center",
                transition: "0.3s",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box sx={{ mb: 2 }}>{step.icon}</Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color: "#2d1a19",
                }}
              >
                {step.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#555",
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </Typography>
            </Box>

            {/* Curved Arrows Between Steps */}
            {!isMobile && index !== currentSteps.length - 1 && (
              <Box
                sx={{
                  position: "relative",
                  width: 120,
                  height: 100,
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 120 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10,50 C50,0 70,100 110,50"
                    stroke="#7D221D"
                    strokeWidth="2.5"
                    fill="transparent"
                    markerEnd="url(#arrowhead)"
                  />
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="6"
                      refY="3"
                      orient="auto"
                      fill="#7D221D"
                    >
                      <path d="M0,0 L0,6 L9,3 z" />
                    </marker>
                  </defs>
                </svg>
              </Box>
            )}

            {/* Mobile ↓ Flow Arrows */}
            {isMobile && index !== currentSteps.length - 1 && (
              <svg
                width="20"
                height="50"
                viewBox="0 0 20 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 0 C15 15 15 35 10 50"
                  stroke="#7D221D"
                  strokeWidth="2.5"
                  fill="transparent"
                  markerEnd="url(#arrowdown)"
                />
                <defs>
                  <marker
                    id="arrowdown"
                    markerWidth="10"
                    markerHeight="10"
                    refX="6"
                    refY="3"
                    orient="auto"
                    fill="#7D221D"
                  >
                    <path d="M0,0 L0,6 L9,3 z" />
                  </marker>
                </defs>
              </svg>
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default HowItWorksSection;
