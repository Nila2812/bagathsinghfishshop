import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const ProductCard = ({ product, onAddToCart, onUpdateCart }) => {
  const [quantity, setQuantity] = useState(0);

  const handleAdd = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onUpdateCart(product, newQty);
  };

  const handleRemove = () => {
    const newQty = quantity - 1;
    if (newQty <= 0) {
      setQuantity(0);
      onAddToCart(product, false);
    } else {
      setQuantity(newQty);
      onUpdateCart(product, newQty);
    }
  };

  const handleAddToCart = () => {
    setQuantity(1);
    onAddToCart(product, true);
  };

  return (
    <Card
      sx={{
        width: 200,
        height: 270,
        borderRadius: 2,
        boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
        p: 1,
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 6px 14px rgba(0,0,0,0.15)",
        },
        "@media (max-width: 768px)": {
          width: 160,
          height: 220,
        },
        "@media (max-width: 480px)": {
          width: 160,
          height: 210,
        },
      }}
    >
      <CardMedia
        component="img"
        height="130"
        image={product.image}
        alt={product.name}
        sx={{
          borderRadius: 2,
          objectFit: "cover",
          "@media (max-width: 768px)": { height: 110 },
          "@media (max-width: 480px)": { height: 100 },
        }}
      />

      <CardContent sx={{ p: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "bold",
            color: "black",
            wordWrap: "break-word",
            whiteSpace: "normal",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "2.8em",
            fontSize: { xs: "0.75rem", sm: "0.8rem" },
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
        >
          {product.weight} | ₹{product.price}
        </Typography>

        {quantity === 0 ? (
          <Button
            variant="contained"
            onClick={handleAddToCart}
            sx={{
              mt: 1,
              backgroundColor: "#e23a3a",
              textTransform: "none",
              fontSize: "0.75rem",
              "&:hover": { backgroundColor: "#cc3232" },
            }}
          >
            Add to Cart
          </Button>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 1,
            }}
          >
            <IconButton size="small" onClick={handleRemove}>
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ mx: 1 }}>
              {quantity}
            </Typography>
            <IconButton size="small" onClick={handleAdd}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
