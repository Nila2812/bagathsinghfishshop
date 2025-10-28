import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";

const Navbar = ({ onLogout }) => {
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleLogoutClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmLogout = () => {
    setOpenConfirm(false);
    if (onLogout) onLogout();
  };

  const handleCancelLogout = () => {
    setOpenConfirm(false);
  };

  return (
    <>
      {/* --- Navbar Section --- */}
      <AppBar
        position="relative"
        sx={{
            width: "96%",
            ml: "4%",
            backgroundColor: "#f7f9fa",
          color: "white",
          boxShadow: "none",
          zIndex: 1000,
          top: 0,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            px: 3,
          }}
        >
          {/* Left: Title */}
          {/* <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: "0.5px",
              whiteSpace: "nowrap",
            }}
          >
            Welcome to Admin Panel
          </Typography> */}

          {/* Right: Logout Button */}
          <Box>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "red",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                px: 3,
                "&:hover": {
                  backgroundColor: "#cc0000",
                },
              }}
              onClick={handleLogoutClick}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* --- Logout Confirmation Dialog --- */}
      <Dialog open={openConfirm} onClose={handleCancelLogout}>
        <DialogTitle>Are you sure you want to logout?</DialogTitle>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelLogout} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLogout}
            color="error"
            variant="contained"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
