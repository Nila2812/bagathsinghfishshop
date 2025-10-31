import React, { useState } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const ProductCard = ({ product, onAddToCart, onUpdateQuantity }) => {
  const [quantity, setQuantity] = useState(0);

  const handleAdd = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onUpdateQuantity(product.id, newQty);
  };

  const handleRemove = () => {
    const newQty = quantity - 1;
    if (newQty <= 0) {
      setQuantity(0);
      onUpdateQuantity(product.id, 0);
    } else {
      setQuantity(newQty);
      onUpdateQuantity(product.id, newQty);
    }
  };

  return (
    <Box
      sx={{
        width: 240,
        borderRadius: 3,
        boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
        p: 2,
        bgcolor: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "0.3s",
        "&:hover": { boxShadow: "0px 6px 18px rgba(0,0,0,0.2)" },
      }}
    >
      <Box
        component="img"
        src={product.image}
        alt={product.name}
        sx={{
          width: "100%",
          height: 140,
          borderRadius: 2,
          objectFit: "cover",
          mb: 1.5,
        }}
      />
      <Typography fontWeight={600}>{product.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {product.weight}
      </Typography>
      <Typography fontWeight={600} sx={{ mt: 0.5 }}>
        ₹{product.price}
      </Typography>

      {quantity === 0 ? (
        <Button
          variant="contained"
          onClick={handleAdd}
          sx={{
            mt: 1.5,
            bgcolor: "#cc1d2e",
            borderRadius: "20px",
            px: 3,
            "&:hover": { bgcolor: "#a71524" },
          }}
        >
          Add to Cart
        </Button>
      ) : (
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#f5f5f5",
            borderRadius: "20px",
            px: 1.5,
            py: 0.5,
          }}
        >
          <IconButton size="small" onClick={handleRemove}>
            <RemoveIcon />
          </IconButton>
          <Typography>{quantity}</Typography>
          <IconButton size="small" onClick={handleAdd}>
            <AddIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default ProductCard;
