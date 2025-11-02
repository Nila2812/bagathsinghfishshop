import React, { useState } from "react";
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

const FormSection = ({ title, fields, values, onChange, onSubmit, onCancel }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required && !values[field.name]) {
        newErrors[field.name] = "Please fill this field";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit();
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        backgroundColor: "#f9fafb",
        borderRadius: 2,
        m: { xs: 2, md: 3 },
      }}
    >
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: "#333",
          textAlign: "center",
          textTransform: "camelcase",
        }}
      >
        {title}
      </Typography>

      <Grid
        container
        spacing={3}
        sx={{
          minWidth: { md: 750, xs: "100%" },
          width: "100%",
        }}
      >
        {fields.map((field) => (
          <Grid key={field.name} size={{ xs: 12, sm: field.fullWidth ? 12 : 6 }}>
            {/* --- SELECT FIELD (FIXED LABEL-ID) --- */}
            {field.type === "select" ? (
              <TextField
                select
                fullWidth
                id={`${field.name}-select`} // unique id
                name={field.name}
                label={
                  <>
                    {field.label}
                    {field.required && <span style={{ color: "red" }}> *</span>}
                  </>
                }
                value={values[field.name] || ""}
                onChange={onChange}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                SelectProps={{
                  native: false,
                  inputProps: { id: `${field.name}-input` }, // ensure select input gets unique id
                }}
                slotProps={{
                  inputLabel: {
                    htmlFor: `${field.name}-input`, // link label to input id
                    shrink: true,
                  },
                }}
                disabled={field.readOnly || false}
                sx={{ minWidth: 170 }}
              >
                {field.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : field.type === "date" ? (
              <TextField
                id={field.name}
                fullWidth
                type="date"
                label={
                  <>
                    {field.label}
                    {field.required && <span style={{ color: "red" }}> *</span>}
                  </>
                }
                name={field.name}
                value={values[field.name] || ""}
                onChange={onChange}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                  input: {
                    readOnly: field.readOnly || false,
                  },
                }}
              />
            ) : field.type === "checkbox" ? (
              <FormControlLabel
                control={
                  <Checkbox
                    id={field.name}
                    name={field.name}
                    checked={Boolean(values[field.name])}
                    onChange={(e) => onChange(e, "checkbox")}
                    color="primary"
                  />
                }
                label={field.label}
              />
            ) : field.type === "file" ? (
              <>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ textAlign: "left" }}
                  htmlFor={field.name}
                >
                  {field.label}
                  {field.required && <span style={{ color: "red" }}> *</span>}
                  <input
                    id={field.name}
                    type="file"
                    name={field.name}
                    hidden
                    onChange={(e) => onChange(e, "file")}
                  />
                </Button>
                {errors[field.name] && (
                  <Typography color="error" variant="caption">
                    {errors[field.name]}
                  </Typography>
                )}
              </>
            ) : (
              <TextField
                id={field.name}
                fullWidth
                label={
                  <>
                    {field.label}
                    {field.required && <span style={{ color: "red" }}> *</span>}
                  </>
                }
                name={field.name}
                type={field.type || "text"}
                value={values[field.name] || ""}
                onChange={onChange}
                error={!!errors[field.name]}
                helperText={errors[field.name]}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                  input: {
                    readOnly: field.readOnly || false,
                  },
                }}
              />
            )}
          </Grid>
        ))}
      </Grid>

      {/* --- ACTION BUTTONS --- */}
      <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
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
