import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogActions,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Navbar = ({ onLogout, onMenuClick }) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleLogoutClick = () => setOpenConfirm(true);
  const handleConfirmLogout = () => {
    setOpenConfirm(false);
    if (onLogout) onLogout();
  };
  const handleCancelLogout = () => setOpenConfirm(false);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          backgroundColor: "#f7f9fa",
          borderBottom: "1px solid #ddd",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: 64,
          }}
        >
          {/* Left section: Hamburger menu + title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={onMenuClick}
                sx={{
                  color: "#000",
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              sx={{
                color: "#000",
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.1rem" },
              }}
            >
              Admin Panel
            </Typography>
          </Box>

          {/* Right section: Logout button */}
          <Box>
            <Button
              variant="contained"
              onClick={handleLogoutClick}
              sx={{
                backgroundColor: "red",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                px: 3,
                py: 0.8,
                borderRadius: 1,
                "&:hover": { backgroundColor: "#cc0000" },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout confirmation dialog */}
      <Dialog open={openConfirm} onClose={handleCancelLogout}>
        <DialogTitle>Are you sure you want to logout?</DialogTitle>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelLogout} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
