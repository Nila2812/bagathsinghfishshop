import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  OutlinedInput,
} from "@mui/material";
import axios from "axios";

const EditProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({ ...product });
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  useEffect(() => {
  let available = false;

  const stock = parseFloat(form.stockQty);
  const minValue = parseFloat(form.minOrderValue);
  const unit = form.minOrderUnit;

  if (["g", "kg"].includes(unit)) {
    const minInKg = unit === "g" ? minValue / 1000 : minValue;
    available = stock >= minInKg;
  } else if (unit === "piece") {
    available = stock >= minValue;
  }

  setForm((prev) => ({ ...prev, isAvailable: available }));
}, [form.minOrderValue, form.minOrderUnit, form.stockQty]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/category")
      .then((res) => {
        const all = res.data;
        const parentIds = new Set(all.map(cat => cat.parentCategory?._id).filter(Boolean));
        const filtered = all.filter(cat => {
          const isSubCategory = !!cat.parentCategory;
          const isLonelyParent = !cat.parentCategory && !parentIds.has(cat._id);
          return isSubCategory || isLonelyParent;
        });
        setCategories(filtered);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });
  }, []);

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.set("isAvailable", form.isAvailable ? "true" : "false");
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/products/${product._id}`, formData);
      onSave(res.data.product);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const getBaseUnitOptions = (unit) => {
    return unit === "piece"
      ? [
          { value: "piece", label: "Piece" },
        ]
      : [
          { value: "250g", label: "250g" },
          { value: "500g", label: "500g" },
          { value: "1kg", label: "1kg" },
        ];
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={6}>
            <TextField label="Name (EN)" name="name_en" value={form.name_en} onChange={handleChange} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label="Name (TA)" name="name_ta" value={form.name_ta} onChange={handleChange} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label="Price" name="price" type="number" value={form.price} onChange={handleChange} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label="Stock Qty" name="stockQty" type="number" value={form.stockQty} onChange={handleChange} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label="Weight Value" name="weightValue" type="number" value={form.weightValue} onChange={handleChange} fullWidth />
          </Grid>
          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel id="weight-unit-label">Weight Unit</InputLabel>
              <Select
                labelId="weight-unit-label"
                name="weightUnit"
                value={form.weightUnit}
                onChange={handleChange}
                input={<OutlinedInput label="Weight Unit" />}
                sx={{ minWidth: 170, fontSize: 16 }}
              >
                <MenuItem value="g">g</MenuItem>
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="piece">Piece</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* ✅ Dynamic Base Unit */}
          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel id="base-unit-label">Base Unit</InputLabel>
              <Select
                labelId="base-unit-label"
                name="baseUnit"
                value={form.baseUnit}
                onChange={handleChange}
                input={<OutlinedInput label="Base Unit" />}
                sx={{ minWidth: 170, fontSize: 16 }}
              >
                {getBaseUnitOptions(form.weightUnit).map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={6}>
            <TextField label="Min Order Value" name="minOrderValue" type="number" value={form.minOrderValue} onChange={handleChange} fullWidth />
          </Grid>
          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel id="min-order-unit-label">Min Order Unit</InputLabel>
              <Select
                labelId="min-order-unit-label"
                name="minOrderUnit"
                value={form.minOrderUnit}
                onChange={handleChange}
                input={<OutlinedInput label="Min Order Unit" />}
                sx={{ minWidth: 170, fontSize: 16 }}
              >
                <MenuItem value="g">g</MenuItem>
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="piece">Piece</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                input={<OutlinedInput label="Category" />}
                sx={{ minWidth: 170, fontSize: 16 }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id} sx={{ fontSize: 16 }}>
                    {cat.name_en}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {form.image?.data && (
            <Grid size={12}>
              <InputLabel>Current Image</InputLabel>
              <img
                src={`data:${form.image.contentType};base64,${form.image.data}`}
                alt="Product"
                style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }}
              />
            </Grid>
          )}

          <Grid size={12}>
            <InputLabel>Upload New Image</InputLabel>
            <input type="file" accept="image/*" onChange={handleImageChange} />
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

export default EditProductModal;
