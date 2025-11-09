import React from "react";
import Slider from "react-slick";
import { Box, Typography, Button } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomeBanner = ({ offer }) => {
  const bannerImages = [
    "src/img/Home2.png",
    "src/img/Home1.png",
     "src/img/Home3.png",
    "src/img/Home4.jpg",
    "src/img/Home5.png",
     "src/img/Home6.png",
  ];

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
    appendDots: dots => (
      <Box
        sx={{
          position: "absolute",
          bottom: "15px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ul style={{ margin: 0, padding: 0 }}>{dots}</ul>
      </Box>
    ),
    customPaging: i => (
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
        width: "100%",
        height: { xs: "240px", md: "420px" },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Custom dot styling (active + hover) */}
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
              height: { xs: "240px", md: "420px" },
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            {/* Overlay */}
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
                color: "white",
                textAlign: "center",
                flexDirection: "column",
                px: 2,
              }}
            >
              {offer ? (
                <>
                  {/* Product Name */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      textTransform: "uppercase",
                       fontFamily: ` 'Montserrat', sans-serif`,
                      fontWeight: "bold",
                      letterSpacing: 1,
                      color: "#ffeb3b",
                    }}
                  >
                    {offer.product}
                  </Typography>

                  {/* Offer Circle */}
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      backgroundColor: "#cc1d2e",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow: "0 0 15px rgba(0,0,0,0.4)",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "13px",
                        color: "white",
                        letterSpacing: 1,
                      }}
                    >
                      ⭐SPECIAL OFFER⭐
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "white" }}>
                      {offer.discount}%
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "white" }}>
                      OFF
                    </Typography>
                  </Box>

                  {/* Price Details */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {offer.originalPrice ? (
                      <>
                        <Typography
                          variant="h6"
                          sx={{ textDecoration: "line-through", opacity: 0.8 }}
                        >
                          ₹{offer.originalPrice}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ color: "#ffeb3b", fontWeight: "bold" }}
                        >
                          ₹{offer.discountedPrice}
                        </Typography>
                      </>
                    ) : (
                      <Typography
                        variant="h4"
                        sx={{ color: "#ffeb3b", fontWeight: "bold" }}
                      >
                        ₹{offer.discountedPrice}
                      </Typography>
                    )}
                  </Box>
                </>
              ) : (
                <>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "#fff",
                      textShadow: "0 2px 5px rgba(0,0,0,0.6)",
                    }}
                  >
                    “Fresh Meat, Juicy Chicken & Daily Catch Fish – All in One Place!”
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mt: 2,
                      opacity: 0.9,
                      fontStyle: "italic",
                    }}
                  >
                    Bringing the taste of freshness from our shop to your kitchen.
                  </Typography>

                  <Box sx={{ mt: 4, display: "flex", gap: 3 }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#cc1d2e",
                        color: "white",
                        px: 4,
                        py: 1,
                        borderRadius: "25px",
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "#a81825",
                        },
                      }}
                    >
                      Explore All Products
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: "white",
                        color: "white",
                        px: 4,
                        py: 1,
                        borderRadius: "25px",
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "white",
                          color: "#cc1d2e",
                        },
                      }}
                    >
                      Contact Us
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default HomeBanner;
