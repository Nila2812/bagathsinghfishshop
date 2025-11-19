import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLanguage } from "./LanguageContext";

const Topbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const { language, toggleLanguage } = useLanguage();

  // 🎯 Disclaimer in both languages
  const disclaimer =
    language === "EN"
      ? "Weight may reduce after cleaning, depending on the fish variety."
      : "மீன் வகைக்கு ஏற்ப சுத்தம் செய்த பின் எடை குறையலாம்.";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "#7D221D",
        color: "#FFFFFF",
        px: isMobile ? 1 : isTablet ? 3 : 5,
        height: isMobile ? 36 : isTablet ? 38 : 40,
        justifyContent: "center",
        fontFamily: `'Montserrat', sans-serif`,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          py: 0,
          gap: isMobile ? 0.5 : 1,
        }}
      >
        {/* === Left: Phone === */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: isMobile ? "0.6rem" : isTablet ? "0.75rem" : "0.85rem",
            color: "#FFFFFF",
            whiteSpace: "nowrap",
          }}
        >
          📞 +91 91506 47008
        </Typography>

        {/* === Center: Scrolling Disclaimer === */}
        <Box
          sx={{
            flex: 1,
            textAlign: "center",
            overflow: "hidden",
            whiteSpace: "nowrap",
            mx: 1,
          }}
        >
          <Typography
            component="div"
            sx={{
              display: "inline-block",
              color: "#FFD700",
              fontSize: isMobile ? "0.65rem" : isTablet ? "0.75rem" : "0.9rem",
              fontWeight: 500,
              animation: "scroll-left 12s linear infinite",
              fontFamily:
                language === "TA"
                  ? "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif"
                  : "'Poppins', 'Lato', sans-serif",
            }}
          >
            {disclaimer}
          </Typography>
        </Box>

        {/* === Right: Language Toggle === */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            backgroundColor: "#000000",
            borderRadius: "20px",
            padding: isMobile ? "2px 6px" : "4px 10px",
            cursor: "pointer",
            width: isMobile ? "70px" : "90px",
            position: "relative",
          }}
          onClick={toggleLanguage}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: language === "EN" ? "#7D221D" : "#FFFFFF",
              zIndex: 1,
              flex: 1,
              textAlign: "center",
              fontSize: isMobile ? "0.6rem" : "0.75rem",
            }}
          >
            EN
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: language === "TA" ? "#7D221D" : "#FFFFFF",
              zIndex: 1,
              flex: 1,
              textAlign: "center",
              fontSize: isMobile ? "0.6rem" : "0.75rem",
            }}
          >
            TA
          </Typography>

          <Box
            sx={{
              position: "absolute",
              top: 2,
              left: language === "EN" ? 2 : "50%",
              width: "48%",
              height: "calc(100% - 4px)",
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              transition: "left 0.3s ease",
            }}
          />
        </Box>
      </Toolbar>

      <style>
        {`
          @keyframes scroll-left {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </AppBar>
  );
};

export default Topbar;
