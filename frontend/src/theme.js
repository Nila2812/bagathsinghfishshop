import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0077B6", // Ocean Blue
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#00B4D8", // Aqua Blue
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FFFFFF", // Page background
      paper: "#F1F5F9", // Card / Section background
    },
    text: {
      primary: "#1E293B", // Charcoal
      secondary: "#475569", // Slate Gray
      disabled: "#94A3B8", // Muted text
    },
    divider: "#E2E8F0",
    error: {
      main: "#E63946", // Coral Red
    },
    success: {
      main: "#2D6A4F", // Sea Green
    },
  },

  typography: {
    fontFamily: "'Poppins', 'Roboto', sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: "#023E8A", // Deep Navy
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      color: "#023E8A",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      color: "#023E8A",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      color: "#023E8A",
    },
    body1: {
      fontSize: "1rem",
      color: "#475569",
    },
    body2: {
      fontSize: "0.95rem",
      color: "#475569",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      borderRadius: "8px",
    },
  },

  components: {
    // === AppBar / NavBar ===
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0077B6", // Primary Blue
          color: "#FFFFFF",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
        },
      },
    },

    // === Buttons ===
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          padding: "10px 20px",
          fontWeight: 600,
          transition: "all 0.3s ease",
        },
        containedPrimary: {
          backgroundColor: "#0077B6",
          "&:hover": {
            backgroundColor: "#023E8A",
          },
        },
        containedSecondary: {
          backgroundColor: "#00B4D8",
          "&:hover": {
            backgroundColor: "#0077B6",
          },
        },
        outlinedPrimary: {
          borderColor: "#0077B6",
          color: "#0077B6",
          "&:hover": {
            backgroundColor: "#E0F7FA",
            borderColor: "#00B4D8",
          },
        },
      },
    },

    // === Cards ===
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 4px 8px rgba(0, 119, 182, 0.15)",
          transition: "transform 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
          },
        },
      },
    },

    // === TextFields ===
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#E2E8F0",
            },
            "&:hover fieldset": {
              borderColor: "#00B4D8",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0077B6",
            },
          },
        },
      },
    },

    // === Typography spacing fix ===
    MuiTypography: {
      styleOverrides: {
        root: {
          marginBottom: "0.5rem",
        },
      },
    },
  },
});

export default theme;
