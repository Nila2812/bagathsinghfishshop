import React from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { useLanguage } from "./LanguageContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";

const HowItWorksSection = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const { language } = useLanguage();

  const tamilFont = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
  const englishFont = "'Poppins', 'Lato', sans-serif";

  const steps = {
    EN: [
      {
        icon: <ShoppingCartIcon sx={{ fontSize: 50, color: "#f4a300" }} />,
        title: "Choose Products",
        desc: "Select from our wide range of fresh chicken, fish, and quail products.",
      },
      {
        icon: <PhoneInTalkIcon sx={{ fontSize: 50, color: "#7D221D" }} />,
        title: "Admin Contacts You",
        desc: "Our admin will contact you to confirm your order and delivery.",
      },
      {
        icon: <LocalShippingIcon sx={{ fontSize: 50, color: "#f4a300" }} />,
        title: "Freshly Prepared & Delivered",
        desc: "Your order is freshly processed and delivered quickly to your doorstep.",
      },
    ],
    TA: [
      {
        icon: <ShoppingCartIcon sx={{ fontSize: 50, color: "#f4a300" }} />,
        title: "தயாரிப்புகளைத் தேர்ந்தெடுக்கவும்",
        desc: "புதிய கோழி, மீன் மற்றும் காடை தயாரிப்புகளில் இருந்து தேர்ந்தெடுக்கவும்.",
      },
      {
        icon: <PhoneInTalkIcon sx={{ fontSize: 50, color: "#7D221D" }} />,
        title: "நிர்வாகி உங்களை தொடர்புகொள்வார்",
        desc: "ஆர்டர் மற்றும் விநியோகத்தை உறுதிப்படுத்த நிர்வாகி தொடர்புகொள்வார்.",
      },
      {
        icon: <LocalShippingIcon sx={{ fontSize: 50, color: "#f4a300" }} />,
        title: "புதியதாக தயாரித்து விரைவில் வழங்கப்படுகிறது",
        desc: "உங்கள் ஆர்டர் புதியதாக தயாரிக்கப்பட்டு விரைவில் வீட்டுக்கு வழங்கப்படுகிறது.",
      },
    ],
  };

  const current = steps[language];

  return (
    <Box
      sx={{
        py: 4,
        px: { xs: 1, sm: 4, md: 4 },
        textAlign: "center",
        background: "linear-gradient(180deg, #f9f9f9ff 0%, #fcf1f1ff 100%)",
        mb:6,
        fontFamily: language === "TA" ? tamilFont : englishFont,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 3,
          color: "#3b1f1d",
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
        }}
      >
        {language === "EN" ? "HOW IT WORKS" : "எப்படி செயல்படுகிறது"}
      </Typography>

      {/* Steps */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "center",
          gap: { xs: 5, md: 6 },
          position: "relative",
          overflow: "visible",
        }}
      >
        {current.map((step, i) => (
          <React.Fragment key={i}>
            <Box
              sx={{
                backgroundColor: "#fff",
                boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
                borderRadius: "20px",
                p: { xs: 2, sm: 4, md: 3 },
                width: { xs: "80%", sm: "80%", md: 280 },
                textAlign: "center",
                position: "relative",
                zIndex: 2,
              }}
            >
              <Box sx={{ mb: 2 }}>{step.icon}</Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.3rem" },
                }}
              >
                {step.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.8rem" },
                }}
              >
                {step.desc}
              </Typography>
            </Box>

            {/* Arrow Logic */}
            {i !== current.length - 1 && (
              <Box
                sx={{
                  width: isMobile ? "30px" : "120px",
                  height: isMobile ? "50px" : "100px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width={isMobile ? "30" : "120"}
                  height={isMobile ? "50" : "100"}
                  viewBox={isMobile ? "0 0 30 50" : "0 0 120 100"}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {isMobile ? (
                    // 📱 Vertical arrow for mobile
                    <path
                      d="M15 5 L15 45"
                      stroke="#7D221D"
                      strokeWidth="2.5"
                      markerEnd="url(#arrowhead)"
                    />
                  ) : (
                    // 💻 Curved arrow for desktop
                    <path
                      d="M10,50 C50,0 70,100 110,50"
                      stroke="#7D221D"
                      strokeWidth="2.5"
                      fill="transparent"
                      markerEnd="url(#arrowhead)"
                    />
                  )}
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
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default HowItWorksSection;
