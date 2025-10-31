import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";

const EditOfferModel = ({ offer, onClose, onSave }) => {
  const [form, setForm] = useState({ ...offer });
  const [products, setProducts] = useState([]);

 useEffect(() => {
  axios.get("http://localhost:5000/api/offers/products")
    .then((res) => {
      setProducts(res.data);

      const selectedId = typeof offer.productIds === "object"
        ? offer.productIds._id || offer.productIds.value
        : offer.productIds;

      const selectedProduct = res.data.find(p => p.value === selectedId);
      const cp = selectedProduct?.price || offer.costPrice;
      const discount = offer.discountPercent || 0;
      const sp = cp - (cp * discount / 100);

      setForm({
        ...offer,
        productIds: selectedProduct?.value || selectedId || offer.productIds,
        costPrice: cp,
        sellingPrice: sp,
      });
    })
    .catch((err) => console.error("Failed to fetch products:", err));
}, [offer]);



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    const selectedProduct = products.find(p => p.value === selectedId);
    const price = selectedProduct?.price || 0;
    const discount = form.discountPercent || 0;
    const sp = price - (price * discount / 100);

    setForm((prev) => ({
      ...prev,
      productIds: selectedId,
      costPrice: price,
      sellingPrice: sp,
    }));
  };

  const handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value);
    const cp = form.costPrice || 0;
    const sp = cp - (cp * discount / 100);

    setForm((prev) => ({
      ...prev,
      discountPercent: discount,
      sellingPrice: sp,
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/offers/${offer._id}`, form);
      onSave(res.data.offer);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Offer</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              label="Offer Title (EN)"
              name="title_en"
              value={form.title_en}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Offer Title (TA)"
              name="title_ta"
              value={form.title_ta}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Description (EN)"
              name="description_en"
              value={form.description_en}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Description (TA)"
              name="description_ta"
              value={form.description_ta}
              onChange={handleChange}
              fullWidth 
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="product-label">Product</InputLabel>
              <Select
                labelId="product-label"
                name="productIds"
                value={form.productIds || ""}
                onChange={handleProductChange}
                sx={{ minWidth: 170, fontSize: 16 }}
              >
                {products.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Cost Price (₹)"
              name="costPrice"
              value={form.costPrice}
              onChange={handleChange}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Discount (%)"
              name="discountPercent"
              value={form.discountPercent}
              onChange={handleDiscountChange}
              fullWidth
              type="number"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Selling Price (₹)"
              name="sellingPrice"
              value={form.sellingPrice}
              onChange={handleChange}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={handleChange}
                  name="isActive"
                />
              }
              label="Active"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={form.startDate?.slice(0, 10) || ""}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={form.endDate?.slice(0, 10) || ""}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOfferModel;
