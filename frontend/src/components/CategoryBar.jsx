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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CategoryBar = ({ fixed = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/category")
      .then(res => {
        const all = res.data;

        const mainCategories = all.filter(cat => !cat.parentCategory);
        const subCategories = all.filter(cat => !!cat.parentCategory);

        const structured = mainCategories.map(main => {
          const children = subCategories.filter(sub => {
            const subParentId = typeof sub.parentCategory === "object"
              ? sub.parentCategory._id
              : sub.parentCategory;
            return subParentId === main._id;
          });

          return {
            _id: main._id,
            name: main.name_en,
            subcategories: children.map(sub => ({
              _id: sub._id,
              name: sub.name_en
            }))
          };
        });

        setCategories(structured);
      })
      .catch(err => {
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
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
             fontFamily: ` 'Montserrat', sans-serif`,
          },
        }}
      />

      <AppBar
        position={fixed ? "fixed" : "static"}
        sx={{
          top: { xs: 150, md: 100 },
          backgroundColor: "#ffff",
          color: "#47332bff",
          maxHeight: 50,
          borderBottom: "1px solid #ddd",
          boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
          zIndex: 1,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 1.5, md: 5 },
            overflowX: "auto",
            whiteSpace: "nowrap",
            px: 2,
            py: 0,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
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
                position: "relative",
                cursor: cat.subcategories?.length ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#4b2c20",
                transition: "color 0.3s ease",
                "&:hover": {
                  color: "#b8860b",
                },
                px: 1.2,
                py: 0.5,
                borderRadius: "6px",
              }}
            >
              <Typography
                sx={{
                  fontSize: isMobile ? "0.80rem" : isTablet ? "0.85rem" : "0.9rem",
                  fontWeight: 500,
                }}
              >
                {formatCategoryName(cat.name)}
              </Typography>

              {cat.subcategories?.length > 0 && (
                <ExpandMoreIcon
                  sx={{
                    fontSize: "1rem",
                    ml: 0.4,
                    color: activeCategoryId === cat._id ? "#b8860b" : "#4b2c20",
                    transition: "transform 0.3s ease, color 0.3s ease",
                    transform:
                      activeCategoryId === cat._id ? "rotate(180deg)" : "rotate(0deg)",
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
                      {formatCategoryName(sub.name)}
                    </MenuItem>
                  ))}
                </Menu>
              )}
            </Box>
          ))}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default CategoryBar;
