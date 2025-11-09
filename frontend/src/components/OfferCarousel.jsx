import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, IconButton, CircularProgress } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axios from "axios";

const OfferCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next');
  const [textAnimating, setTextAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);
  const isTransitioning = useRef(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    isTransitioning.current = true;
    setIsAnimating(true);
    setTextAnimating(true);
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTextAnimating(false);
      isTransitioning.current = false;
    }, 800);
    
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/offers/active");
      
      const transformedOffers = response.data.map((offer) => {
        console.log("Offer data:", offer); // Debug log
        return {
          id: offer._id,
          offerTitle: offer.title_en || "Special Offer", // Offer title from database
          productTitle: offer.productIds?.name_en || "Product", // Product name
          description: offer.description_en || "",
          discount: `${offer.discountPercent || 0}% OFF`,
          discountPercent: offer.discountPercent || 0, // Store numeric value for checking
          image: offer.productIds?.image?.data 
            ? `data:${offer.productIds.image.contentType};base64,${offer.productIds.image.data}`
            : "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&h=600&fit=crop",
          sellingPrice: offer.sellingPrice,
          costPrice: offer.costPrice,
        };
      });

      console.log("Transformed offers:", transformedOffers); // Debug log
      setOffers(transformedOffers);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError("Failed to load offers");
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (isTransitioning.current) return;
    setSlideDirection('next');
    setCurrentSlide((prev) => (prev + 1) % offers.length);
  };

  const prevSlide = () => {
    if (isTransitioning.current) return;
    setSlideDirection('prev');
    setCurrentSlide((prev) => (prev === 0 ? offers.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    if (isTransitioning.current || index === currentSlide) return;
    setSlideDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
  };

  const handleTouchStart = (e) => {
    if (offers.length <= 1 || isTransitioning.current) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isTransitioning.current) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          py: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  const currentOffer = offers[currentSlide];

  return (
    <Box
      sx={{
        py: { xs: 2, md: 3 },
        px: { xs: 2, md: 4 },
        backgroundColor: "#f9f9f9cd",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          fontWeight: 700,
          mb: { xs: 2, md: 3 },
          fontSize: { xs: "1.25rem", md: "1.75rem" },
          color: "#1a1a1a",
        }}
      >
        Special Offers
      </Typography>

      <Box
        sx={{
          maxWidth: "1100px",
          mx: "auto",
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: { xs: 2, sm: 0 },
            backgroundColor: "#666668ff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            height: { xs: "auto", sm: "350px" },
          }}
        >
          {/* Left Side - Text Content */}
          <Box
            sx={{
              p: { xs: 2.5, md: 3.5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: { xs: "center", sm: "flex-end" },
              textAlign: { xs: "center", sm: "right" },
              backgroundColor: "#ffd4d4ff",
              order: { xs: 2, sm: 1 },
              transform: textAnimating 
                ? `translateX(${slideDirection === 'next' ? '100%' : '-100%'})` 
                : 'translateX(0)',
              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: textAnimating
                ? `textSlide${slideDirection === 'next' ? 'Left' : 'Right'} 0.8s cubic-bezier(0.4, 0, 0.2, 1)`
                : 'none',
              '@keyframes textSlideLeft': {
                from: { transform: 'translateX(100%)' },
                to: { transform: 'translateX(0)' }
              },
              '@keyframes textSlideRight': {
                from: { transform: 'translateX(-100%)' },
                to: { transform: 'translateX(0)' }
              },
            }}
          >
            {/* Offer Title - Always centered - FIRST */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: { xs: 1.2, md: 1.8 },
                fontSize: { xs: "1rem", md: "1.5rem" },
                color: "#1a1a1a",
                lineHeight: 1.2,
                textAlign: "center",
                width: "100%",
              }}
            >
              {currentOffer.offerTitle}
            </Typography>

            {/* Discount Badge - Only show if discount > 0 */}
            {currentOffer.discountPercent > 0 && (
              <Box
                sx={{
                  display: "inline-block",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  px: { xs: 1.5, md: 2 },
                  py: { xs: 0.6, md: 0.8 },
                  borderRadius: "50px",
                  fontWeight: 700,
                  fontSize: { xs: "0.7rem", md: "0.9rem" },
                  mb: { xs: 1.2, md: 1.8 },
                  width: "fit-content",
                }}
              >
                {currentOffer.discount}
              </Box>
            )}

            {/* Product Title - Follows container alignment */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: { xs: 1.2, md: 1.8 },
                fontSize: { xs: "0.85rem", md: "1.1rem" },
                color: "#333",
                lineHeight: 1.2,
              }}
            >
              {currentOffer.productTitle}
            </Typography>

            {/* Description */}
            <Typography
              sx={{
                mb: { xs: 1.5, md: 2.5 },
                color: "#555",
                fontSize: { xs: "0.75rem", md: "0.95rem" },
                lineHeight: 1.5,
              }}
            >
              {currentOffer.description}
            </Typography>

            {/* CTA Button */}
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ fontSize: { xs: "0.9rem", md: "1.2rem" } }} />}
              onClick={() => {
                console.log("View offer:", currentOffer.id);
              }}
              sx={{
                backgroundColor: "#1a1a1a",
                color: "#fff",
                px: { xs: 2, md: 2.5 },
                py: { xs: 0.8, md: 1 },
                borderRadius: "50px",
                fontWeight: 600,
                fontSize: { xs: "0.7rem", md: "0.85rem" },
                textTransform: "uppercase",
                width: "fit-content",
                "&:hover": {
                  backgroundColor: "#333",
                },
              }}
            >
              VIEW & ORDER
            </Button>
          </Box>

          {/* Right Side - Image */}
          <Box
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            sx={{
              position: "relative",
              height: { xs: "180px", sm: "350px" },
              width: "100%",
              order: { xs: 1, sm: 2 },
              overflow: "hidden",
              touchAction: "pan-y pinch-zoom",
            }}
          >
            <Box
              component="img"
              src={currentOffer.image}
              alt={currentOffer.offerTitle}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                transform: isAnimating 
                  ? `translateX(${slideDirection === 'next' ? '-100%' : '100%'})`
                  : 'translateX(0)',
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: isAnimating
                  ? `slide${slideDirection === 'next' ? 'Right' : 'Left'} 0.8s cubic-bezier(0.4, 0, 0.2, 1)`
                  : 'none',
                '@keyframes slideRight': {
                  from: { transform: 'translateX(-100%)' },
                  to: { transform: 'translateX(0)' }
                },
                '@keyframes slideLeft': {
                  from: { transform: 'translateX(100%)' },
                  to: { transform: 'translateX(0)' }
                }
              }}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&h=600&fit=crop";
              }}
            />

            {offers.length > 1 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: { xs: 10, md: 20 },
                  left: { xs: 10, md: 20 },
                  display: "flex",
                  gap: { xs: 1.5, md: 2 },
                  zIndex: 10,
                }}
              >
                <IconButton
                  onClick={prevSlide}
                  disabled={isTransitioning.current}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    width: { xs: 38, md: 50 },
                    height: { xs: 38, md: 50 },
                    "&:hover": {
                      backgroundColor: "#fff",
                    },
                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                  }}
                >
                  <ArrowBackIosIcon sx={{ ml: 0.5, fontSize: { xs: "1rem", md: "1.5rem" } }} />
                </IconButton>

                <IconButton
                  onClick={nextSlide}
                  disabled={isTransitioning.current}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    width: { xs: 38, md: 50 },
                    height: { xs: 38, md: 50 },
                    "&:hover": {
                      backgroundColor: "#fff",
                    },
                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                  }}
                >
                  <ArrowForwardIosIcon sx={{ fontSize: { xs: "1rem", md: "1.5rem" } }} />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>

        {offers.length > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1.5,
              mt: { xs: 2, md: 3 },
            }}
          >
            {offers.map((_, index) => (
              <Box
                key={index}
                onClick={() => goToSlide(index)}
                sx={{
                  width: currentSlide === index ? 30 : 12,
                  height: 12,
                  borderRadius: "6px",
                  backgroundColor:
                    currentSlide === index ? "#1a1a1a" : "#d0d0d0",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    backgroundColor:
                      currentSlide === index ? "#1a1a1a" : "#999",
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OfferCarousel;