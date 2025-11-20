import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Menu,
  MenuItem,
  GlobalStyles,
  Fade,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./LanguageContext"; // ✅ import context hook

const CategoryBar = ({ fixed = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage(); // ✅ context hook

  const [categories, setCategories] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/category")
      .then((res) => {
        const all = res.data;
        const mainCategories = all.filter((cat) => !cat.parentCategory);
        const subCategories = all.filter((cat) => !!cat.parentCategory);

        const structured = mainCategories.map((main) => {
          const children = subCategories.filter((sub) => {
            const subParentId =
              typeof sub.parentCategory === "object"
                ? sub.parentCategory._id
                : sub.parentCategory;
            return subParentId === main._id;
          });

          return {
            _id: main._id,
            name_en: main.name_en,
            name_ta: main.name_ta,
            subcategories: children.map((sub) => ({
              _id: sub._id,
              name_en: sub.name_en,
              name_ta: sub.name_ta,
            })),
          };
        });

        setCategories(structured);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });
  }, []);

  const handleMouseEnter = (event, categoryId) => {
    setAnchorEl(event.currentTarget);
    setActiveCategoryId(categoryId);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      setAnchorEl(null);
      setActiveCategoryId(null);
    }, 200);
  };


  const formatCategoryName = (name) =>
    name
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            fontFamily: `'Montserrat', sans-serif`,
          },
        }}
      />

      <AppBar
        position={fixed ? "fixed" : "static"}
        sx={{
          top: { xs: 91.7, sm: 108, md: 110 },
          background: "linear-gradient(180deg, #f9f9f9ff 0%, #f8d1d1ff 100%)",
          color: "#47332bff",
          height: { xs: 35, sm: 35, md: 40 },
          borderTop: "1px solid #ddd",
          borderBottom: "1px solid #ddd",
          boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
          zIndex: 1,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 35, sm: 35, md: 40 },
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "flex-start", sm: "center", md: "center" },
            px: { xs: 1, sm: 3, md: 6 },
            py: 0,
            overflowX: "auto",
            overflowY: "hidden",
            whiteSpace: "nowrap",
            scrollBehavior: "smooth",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              flexWrap: "nowrap",
              gap: { xs: 1.5, sm: 3, md: 4 },
              flexShrink: 0,
            }}
          >
            
            {/* ✅ Category List */}
            {categories.map((cat) => (
              <Box
                key={cat._id}
                onMouseEnter={(e) => handleMouseEnter(e, cat._id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => {
                  if (!cat.subcategories?.length) {
                    navigate(`/category/${cat._id}`);
                  }
                }}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: cat.subcategories?.length ? "default" : "pointer",
                  px: 1.2,
                  py: 0.3,
                  borderRadius: "6px",
                  flexShrink: 0,
                  color: "#4b2c20",
                  fontWeight: 600,
                  transition: "color 0.3s ease, background-color 0.3s ease",
                  "&:hover": {
                    color: "#b8860b",
                    backgroundColor: "#fff9e6",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: isMobile ? "0.8rem" : isTablet ? "0.85rem" : "0.9rem",
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {formatCategoryName(
                    language === "EN" ? cat.name_en : cat.name_ta
                  )}
                </Typography>

                {cat.subcategories?.length > 0 && (
                  <ExpandMoreIcon
                    sx={{
                      fontSize: "1rem",
                      ml: 0.3,
                      color:
                        activeCategoryId === cat._id ? "#b8860b" : "#4b2c20",
                      transition: "transform 0.3s ease, color 0.3s ease",
                      transform:
                        activeCategoryId === cat._id
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                    }}
                  />
                )}

                {cat.subcategories?.length > 0 && (
                  <Menu
                    anchorEl={anchorEl}
                    open={activeCategoryId === cat._id}
                    onClose={handleMouseLeave}
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 200 }}
                    MenuListProps={{
                      onMouseLeave: handleMouseLeave,
                      sx: {
                        backgroundColor: "#fffef5",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        minWidth: 160,
                        py: 0,
                        color: "#4b2c20",
                      },
                    }}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    {cat.subcategories.map((sub) => (
                      <MenuItem
                        key={sub._id}
                        onClick={() => navigate(`/category/${sub._id}`)}
                        sx={{
                          fontSize: "0.9rem",
                          color: "#4b2c20",
                          transition: "background-color 0.3s, color 0.3s",
                          "&:hover": {
                            backgroundColor: "#fff0d2",
                            color: "#b8860b",
                          },
                        }}
                      >
                        {formatCategoryName(
                          language === "EN" ? sub.name_en : sub.name_ta
                        )}
                      </MenuItem>
                    ))}
                  </Menu>
                )}
              </Box>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default CategoryBar;
