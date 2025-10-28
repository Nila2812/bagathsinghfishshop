import React from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
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
        ml: "10%",
        mr: "10%",
        p: 3,
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 600, color: "#333" , textAlign: "center"}}
      >
        {title}
      </Typography>

      <Grid container spacing={3} sx={{ minWidth: 750 }}>
        {fields.map((field) => (
          <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={field.name}>
            {/* --- SELECT FIELD --- */}
            {field.type === "select" ? (
                <TextField
                select
                fullWidth
                label={field.label}
                name={field.name}
                value={values[field.name] || ""}
                onChange={onChange}
                InputLabelProps={{
                  shrink: Boolean(values[field.name]), // stays up if a value exists
                }}
                sx={{
                  minWidth: 160 ,
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 12px) scale(1)", // label inside initially
                    transition: "all 0.2s ease",
                  },
                  "& .Mui-focused .MuiInputLabel-root": {
                    transform: "translate(14px, -9px) scale(0.75)", // float up on focus
                  },
                  "& .MuiInputLabel-shrink": {
                    transform: "translate(14px, -9px) scale(0.75)", // float up if value exists
                  },
                  // "& .MuiSelect-select": {
                  //   paddingTop: "20px",
                  //   paddingBottom: "10px",
                  // },
                }}
              >
                {field.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

            /* --- DATE FIELD --- */
            ) : field.type === "date" ? (
              <TextField
                fullWidth
                type="date"
                label={field.label}
                name={field.name}
                value={values[field.name] || ""}
                onChange={onChange}
                InputLabelProps={{
                  shrink: true, // 👈 label always visible above
                }}
              />

            /* --- CHECKBOX FIELD --- */
            ) : field.type === "checkbox" ? (
              <FormControlLabel
                control={
                  <Checkbox
                    name={field.name}
                    checked={Boolean(values[field.name])}
                    onChange={(e) => onChange(e, "checkbox")}
                    color="primary"
                  />
                }
                label={field.label} // 👈 label text visible beside checkbox
              />

            /* --- FILE FIELD --- */
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
                  onChange={(e) => onChange(e, "file")}
                />
              </Button>

            /* --- DEFAULT TEXT / NUMBER FIELDS --- */
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

      {/* --- ACTION BUTTONS --- */}
      <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={onSubmit}>
          Save
        </Button>
        <Button variant="outlined" color="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default FormSection;
