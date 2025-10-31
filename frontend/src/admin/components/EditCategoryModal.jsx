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
  OutlinedInput,
  Typography,
} from "@mui/material";
import axios from "axios";

const EditCategoryModal = ({ category, onClose, onSave }) => {
  const [form, setForm] = useState({ ...category });
  const [allCategories, setAllCategories] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    axios.get("http://localhost:5000/api/category")
      .then((res) => {
        setAllCategories(res.data.filter(c => c._id !== category._id)); // exclude self
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });
  }, [category._id]);

  const handleSubmit = async () => {
  const data = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (key === "parentCategory") {
      // Normalize to string ID or empty
      const normalized = typeof value === "object" ? value?._id || "" : value;
      data.append("parentCategory", normalized);
    } else if (key !== "image" && key !== "newImage") {
      data.append(key, value);
    }
  });

  if (form.newImage) {
    data.append("image", form.newImage);
  }

  try {
    const res = await axios.put(
      `http://localhost:5000/api/category/${category._id}`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    onSave(res.data.category);
  } catch (err) {
    console.error("Update failed:", err);
  }
};


  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Category</DialogTitle>
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
              <InputLabel id="parent-label">Main Category</InputLabel>
              
              <Select
                labelId="parent-label"
                name="parentCategory"
                value={form.parentCategory || ""}
                onChange={handleChange}
                input={<OutlinedInput label="Main Category" />}
                sx={{ minWidth: 170, fontSize: 16 }}
              >
                <MenuItem value="">None</MenuItem>
                {allCategories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name_en}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* ✅ Show current image */}
          {form.image?.data && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Current Image:</Typography>
              <img
                src={`data:${form.image.contentType};base64,${form.image.data}`}
                alt="Category"
                style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }}
              />
            </Grid>
          )}

          {/* ✅ Upload new image */}
          <Grid item xs={12}>
            <InputLabel>Upload New Image</InputLabel>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setForm((prev) => ({ ...prev, newImage: e.target.files[0] }));
              }}
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

export default EditCategoryModal;
