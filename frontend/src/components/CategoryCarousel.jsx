import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./LanguageContext"; 

const CategoryCarousel = () => {
  const [categories, setCategories] = useState([]);
  const [showArrows, setShowArrows] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(6);
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const { language } = useLanguage(); // ✅ Use selected language (EN / TA)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/category");
        const data = res.data;

        const allCategories = [];
        data.forEach((cat) => {
          const formatted = {
            _id: cat._id,
            name_en: cat.name_en,
            name_ta: cat.name_ta,
            image: cat.image?.data
              ? `data:${cat.image.contentType};base64,${cat.image.data}`
              : "/placeholder.png",
          };
          allCategories.push(formatted);

          if (cat.subcategories && cat.subcategories.length > 0) {
            cat.subcategories.forEach((sub) => {
              allCategories.push({
                _id: sub._id,
                name_en: sub.name_en,
                name_ta: sub.name_ta,
                image: sub.image?.data
                  ? `data:${sub.image.contentType};base64,${sub.image.data}`
                  : "/placeholder.png",
              });
            });
          }
        });

        setCategories(allCategories);
        setTimeout(() => sliderRef.current?.slickGoTo(0, true), 0);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Responsive slides count
  const updateSlidesToShow = () => {
    const width = window.innerWidth;
    if (width <= 375) setSlidesToShow(2);
    else if (width <= 425) setSlidesToShow(3);
    else if (width <= 768) setSlidesToShow(4);
    else if (width <= 1024) setSlidesToShow(4);
    else setSlidesToShow(6);
  };

  useEffect(() => {
    updateSlidesToShow();
    window.addEventListener("resize", updateSlidesToShow);
    return () => window.removeEventListener("resize", updateSlidesToShow);
  }, []);

  useEffect(() => {
    setShowArrows(categories.length > slidesToShow);
  }, [categories, slidesToShow]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 600,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: false,
    nextArrow: showArrows ? (
      <ArrowButton
        direction="next"
        currentSlide={currentSlide}
        categories={categories}
        slidesToShow={slidesToShow}
      />
    ) : null,
    prevArrow: showArrows ? (
      <ArrowButton
        direction="prev"
        currentSlide={currentSlide}
        categories={categories}
        slidesToShow={slidesToShow}
      />
    ) : null,
    beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
  };

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        py: { xs: 3, md: 6 },
        px: { xs: 3, sm: 3, md: 6 },
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* ✅ Title - dynamic language */}
      <Typography
        variant="h4"
        sx={{
          color: "#4E2C1E",
          fontWeight: 700,
          fontFamily: `'Montserrat', sans-serif`,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontSize: { xs: "1.2rem", sm: "1.6rem", md: "2rem" },
        }}
      >
        {language === "EN" ? "Shop by Category" : "வகைப்படி வாங்குங்கள்"}
      </Typography>

      {/* ✅ Subtext */}
      <Typography
        variant="subtitle1"
        sx={{
          color: "#000000",
          fontFamily: `'Poppins', sans-serif`,
          fontSize: { xs: "0.7rem", sm: "1rem" },
          mt: 0,
          mb: { xs: 2.5, md: 4.5 },
        }}
      >
        {language === "EN"
          ? "Order online. Relax. We’ll deliver."
          : "ஆன்லைனில் ஆர்டர் செய்யுங்கள். நாங்கள் வழங்குகிறோம்."}
      </Typography>

      <Box sx={{ position: "relative", pb: 4 }}>
        <Slider ref={sliderRef} {...settings}>
          {categories.map((cat) => (
            <Box
              key={cat._id}
              onClick={() => navigate(`/category/${cat._id}`)}
              sx={{
                px: { xs: 0.5, sm: 1, md: 1.2 },
                pt: 1,
                cursor: "pointer",
                "&:hover .catName": { color: "#7B4B2A" },
              }}
            >
              <Box
                sx={{
                  width: { xs: 90, sm: 105, md: 120 },
                  height: { xs: 80, sm: 95, md: 110 },
                  mx: "auto",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "1px solid #282727ff",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                  backgroundColor: "#fff",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 14px rgba(0,0,0,0.25)",
                    zIndex: 10,
                  },
                }}
              >
                <Box
                  component="img"
                  src={cat.image}
                  alt={language === "EN" ? cat.name_en : cat.name_ta}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              </Box>
              <Typography
                className="catName"
                sx={{
                  mt: { xs: 1, sm: 1.2, md: 1.4 },
                  fontWeight: 600,
                  color: "#3C1E0A",
                  fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.9rem" },
                  transition: "color 0.3s ease",
                  textTransform: "capitalize",
                }}
              >
                {language === "EN" ? cat.name_en : cat.name_ta}
              </Typography>
            </Box>
          ))}
        </Slider>
      </Box>
    </Box>
  );
};

// ✅ Arrow Button Component (unchanged)
const ArrowButton = ({ onClick, direction, currentSlide, categories, slidesToShow }) => {
  const isPrevHidden = direction === "prev" && currentSlide === 0;
  const isNextHidden =
    direction === "next" && currentSlide >= categories.length - slidesToShow;

  if (isPrevHidden || isNextHidden) return null;

  return (
    <IconButton
      onClick={onClick}
      sx={{
        backgroundColor: "#ffffff",
        color: "#5C3520",
        position: "absolute",
        top: "50%",
        zIndex: 20,
        transform: "translateY(-50%)",
        ...(direction === "prev" ? { left: -20 } : { right: -20 }),
        width: { xs: 28, sm: 36, md: 42 },
        height: { xs: 28, sm: 36, md: 42 },
        borderRadius: "50%",
        boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: "#f0ebe8ff",
          transform: "translateY(-50%) scale(1.1)",
        },
        "&:active": {
          transform: "translateY(-50%) scale(0.95)",
        },
      }}
    >
      {direction === "prev" ? <ArrowBackIosNew /> : <ArrowForwardIos />}
    </IconButton>
  );
};

export default CategoryCarousel;
