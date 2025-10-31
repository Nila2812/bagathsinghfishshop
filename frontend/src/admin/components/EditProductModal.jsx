import React, { useState } from "react";
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
} from "@mui/material";
import axios from "axios";
import { useEffect } from "react";
import { OutlinedInput } from "@mui/material";

const EditProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({
    ...product,
  });
  
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
  let available = true;

  const weight = parseFloat(form.weightValue);
  const stock = parseFloat(form.stockQty);
  const unit = form.weightUnit;

  if (["g", "kg"].includes(unit)) {
    const weightInKg = unit === "g" ? weight / 1000 : weight;
    available = stock >= weightInKg;
  } else if (["piece", "pieces"].includes(unit)) {
    available = stock >= weight;
  }

  setForm((prev) => ({ ...prev, isAvailable: available }));
}, [form.weightValue, form.weightUnit, form.stockQty]);

useEffect(() => {
  axios.get("http://localhost:5000/api/category")
    .then((res) => {
      const all = res.data;

      // Step 1: Find all parent IDs
      const parentIds = new Set(all.map(cat => cat.parentCategory?._id).filter(Boolean));

      // Step 2: Filter categories
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

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              label="Name (EN)"
              name="name_en"
              value={form.name_en}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Name (TA)"
              name="name_ta"
              value={form.name_ta}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Stock Qty"
              name="stockQty"
              type="number"
              value={form.stockQty}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Weight Value"
              name="weightValue"
              type="number"
              value={form.weightValue}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
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
          
          <Grid item xs={6}>
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
  <Grid item xs={12}>
    <InputLabel>Current Image</InputLabel>
    <img
      src={`data:${form.image.contentType};base64,${form.image.data}`}
      alt="Product"
      style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }}
    />
  </Grid>
)}

          <Grid item xs={12}>
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
