import React, { useState } from "react";
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

const CategoryBar = ({ fixed = true }) => {
   const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [categories] = useState([
    { name: "Sea Fish" },
    { name: "Pond Fish" },
    {
      name: "Chicken",
      subcategories: [
        { name: "Poultry Chicken" },
        { name: "Country Chicken" },
      ],
    },
    { name: "Quail" },
  ]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // --- Open dropdown on hover
  const handleMouseEnter = (event, category) => {
    if (category.subcategories) {
      setAnchorEl(event.currentTarget);
      setActiveCategory(category.name);
    }
  };

  // --- Close dropdown smoothly
  const handleMouseLeave = () => {
    setTimeout(() => {
      setAnchorEl(null);
      setActiveCategory(null);
    }, 200); // slight delay for smooth fade
  };

  // --- Capitalize each word (e.g., "sea fish" → "Sea Fish")
  const formatCategoryName = (name) =>
    name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <>
      {/* === Global Font Import === */}
      <GlobalStyles
  styles={{
    body: {
      fontFamily: `'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
    },
  }}
/>


      {/* === CATEGORY BAR === */}
      <AppBar
        position={fixed ? "fixed" : "static"}
        sx={{
          top: { xs: 160, md: 101 },
          backgroundColor: "#ffff", // light cream
          color: "#47332bff", // deep brown
          maxHeight: 50,
          borderBottom: "1px solid #ddd",
          boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)", // bottom shadow
          zIndex: 1,
          fontFamily: `'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
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
          {categories.map((cat, index) => (
            <Box
              key={index}
              onMouseEnter={(e) => handleMouseEnter(e, cat)}
              onMouseLeave={handleMouseLeave}
              sx={{
                position: "relative",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#4b2c20",
                transition: "color 0.3s ease",
                "&:hover": {
                  color: "#b8860b", // golden hover
                },
                px: 1.2,
                py: 0.5,
                borderRadius: "6px",
              }}
            >
              <Typography sx={{ 
                fontSize: isMobile ? "0.80rem" : isTablet ? "0.85rem" : "0.9rem",
              fontWeight: 500,
              }}>
              {formatCategoryName(cat.name)}
              </Typography>

              {/* Down Arrow Icon */}
              {cat.subcategories && (
                <ExpandMoreIcon
                  sx={{
                    fontSize: "1rem",
                    ml: 0.4,
                    color:
                      activeCategory === cat.name ? "#b8860b" : "#4b2c20",
                    transition: "transform 0.3s ease, color 0.3s ease",
                    transform:
                      activeCategory === cat.name
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                  }}
                />
              )}

              {/* === Subcategory Dropdown === */}
              {cat.subcategories && (
                <Menu
                  anchorEl={anchorEl}
                  open={activeCategory === cat.name}
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
                  {cat.subcategories.map((sub, subIndex) => (
                    <MenuItem
                      key={subIndex}
                      onClick={() => console.log(`Navigate to ${sub.name}`)}
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
