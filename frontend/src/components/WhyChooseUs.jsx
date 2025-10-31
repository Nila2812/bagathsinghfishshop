import React from "react";
import { Box, Typography } from "@mui/material";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

const WhyChooseUs = () => {
  const features = [
    {
      icon: <LocalDiningIcon sx={{ fontSize: 50, color: "#7d221d" }} />,
      title: "Daily Fresh Stock",
      description: "Only the freshest products are selected for you every day.",
    },
    {
      icon: <Inventory2Icon sx={{ fontSize: 50, color: "#7d221d" }} />,
      title: "Hygienically Cleaned & Packed",
      description:
        "Every item is carefully cleaned and neatly packed to maintain hygiene.",
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 50, color: "#7d221d" }} />,
      title: "Prompt Home Delivery",
      description:
        "Delivered fresh to your doorstep with temperature-safe packaging.",
    },
    {
      icon: <MonetizationOnIcon sx={{ fontSize: 50, color: "#7d221d" }} />,
      title: "Transparent Pricing",
      description: "Clear pricing with no hidden charges or surprises.",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        mt:{ xs: 4, md: 9 },
        //backgroundColor: "#fff",
        py: { xs: 4, md: 6 },
        fontFamily: `"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif`,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: { xs: 3, md: 5 },
            fontSize: { xs: "1.5rem", md: "2.5rem" },
          color: "#7d221d",
          textTransform: "camelcase",
        }}
      >
        Why Choose Us
      </Typography>

      {/* 🔹 Responsive Container */}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "flex-start", md: "center" },
          alignItems: "stretch",
          flexWrap: { md: "nowrap" },
          gap: { xs: 2, md: 3 },
          overflowX: { xs: "auto", md: "visible" },
          scrollSnapType: { xs: "x mandatory", md: "none" },
          px: { xs: 2, md: 0 },
           py: 1,
          "::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none", // hides scrollbar in Firefox
        }}
      >
        {features.map((feature, index) => (
          <Box
            key={index}
            sx={{
              flex: { xs: "0 0 80%", sm: "0 0 45%", md: "1 1 22%" },
              minWidth: { xs: "80%", sm: "45%", md: "22%" },
              backgroundColor: "#fafafa",
              borderRadius: 3,
              textAlign: "center",
              p: { xs: 3, md: 2 },
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              scrollSnapAlign: "center",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
              },
            }}
          >
            {feature.icon}
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#7d221d",
                mt: 1.5,
                mb: 1,
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              {feature.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#333",
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              {feature.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default WhyChooseUs;
