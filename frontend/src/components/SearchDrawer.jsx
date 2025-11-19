import React, { useState } from "react";
import {
  Drawer,
  Box,
  IconButton,
  InputBase,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

const SearchDrawer = ({ open, onClose, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      onSearch(searchTerm.trim());
      onClose();
    }
  };

  return (
    <Drawer
      anchor="top"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { height: "auto", backgroundColor: "#fff", py: 2 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          gap: 1.5,
        }}
      >
        <IconButton onClick={onClose} sx={{ color: "#000" }}>
          <CloseIcon />
        </IconButton>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            backgroundColor: "#f8f8f8",
            borderRadius: 2,
            border: "1px solid #000",
            px: 1.5,
            py: 0.5,
          }}
        >
          <SearchIcon sx={{ mr: 1, color: "#000" }} />
          <InputBase
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            sx={{ width: "100%" }}
          />
        </Box>
      </Box>

      {/* Optional: You can show recent searches or suggestions */}
      {searchTerm && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Typography variant="body2" sx={{ color: "#555" }}>
            Searching for "{searchTerm}"
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default SearchDrawer;
