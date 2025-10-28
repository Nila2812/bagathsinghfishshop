import React from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
} from "@mui/material";

/**
 * Reusable FormSection component
 *
 * Props:
 * - title: string → section title (e.g. "Add Product")
 * - fields: array → list of field configs { name, label, type, options }
 * - values: object → form data state
 * - onChange: function → handles input change
 * - onSubmit: function → submit handler
 * - onCancel: function → cancel handler
 */
const FormSection = ({ title, fields, values, onChange, onSubmit, onCancel }) => {
  return (
    <Box
      sx={{
        ml: "20%",
        p: 4,
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 600, color: "#333" }}
      >
        {title}
      </Typography>

      <Grid container spacing={3} sx={{ maxWidth: 700 }}>
        {fields.map((field) => (
          <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={field.name}>
            {field.type === "select" ? (
              <TextField
                select
                fullWidth
                label={field.label}
                name={field.name}
                value={values[field.name] || ""}
                onChange={onChange}
              >
                {field.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : field.type === "file" ? (
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ textAlign: "left" }}
              >
                {field.label}
                <input
                  type="file"
                  name={field.name}
                  hidden
                  onChange={(e) => onChange(e, field.name)}
                />
              </Button>
            ) : (
              <TextField
                fullWidth
                label={field.label}
                name={field.name}
                type={field.type || "text"}
                value={values[field.name] || ""}
                onChange={onChange}
              />
            )}
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default FormSection;
