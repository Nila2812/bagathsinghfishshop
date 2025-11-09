import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const Topbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [language, setLanguage] = useState("EN");

  const handleToggle = () => {
    setLanguage((prev) => (prev === "EN" ? "TA" : "EN"));
  };

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
        fontFamily: ` 'Montserrat', sans-serif`,
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
          minHeight: "auto",
          py: 0,
          gap: isMobile ? 0.5 : 1,
           fontFamily: ` 'Montserrat', sans-serif`,
        }}
      >
        {/* === Left: Phone Number === */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: isMobile ? "0.6rem" : isTablet ? "0.75rem" : "0.85rem",
            color: "#FFFFFF",
            whiteSpace: "nowrap",
          }}
        >
          📞 +91 98765 43210
        </Typography>

        {/* === Center: Scrolling Disclaimer === */}
        <Box
          sx={{
            flex: 1,
            textAlign: "center",
            overflow: "hidden",
            whiteSpace: "nowrap",
            mx: 1,
            //backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "4px",
            px: 1,
          }}
        >
          <Typography
            component="div"
            sx={{
              display: "inline-block",
              color: "#ff0000ff",
              fontSize: isMobile ? "0.65rem" : isTablet ? "0.75rem" : "0.9rem",
              fontWeight: 500,
              animation: "scroll-left 10s linear infinite",
            }}
          >
            Weight may reduce after cleaning, depending on the fish variety.
          </Typography>
        </Box>

        {/* === Right: Language Toggle === */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            backgroundColor: "#000000ff",
            borderRadius: "20px",
            padding: isMobile ? "2px 6px" : "4px 10px",
            cursor: "pointer",
            width: isMobile ? "70px" : "90px",
            //border: "1px solid #FFD6D6",
            position: "relative",
            "&:hover": {
              color: "#FFD6D6",
            },
          }}
          onClick={handleToggle}
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

          {/* Sliding toggle */}
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

      {/* === Animation Keyframes === */}
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
