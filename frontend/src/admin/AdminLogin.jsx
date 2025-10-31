import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ import this
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const AdminLogin = () => {
  const navigate = useNavigate(); // ✅ for navigation
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loginStatus, setLoginStatus] = useState(null);

  const sampleAdmins = [
    { username: "admin", password: "admin123" },
    { username: "nila", password: "fishshop@2025" },
  ];

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundUser = sampleAdmins.find(
      (user) =>
        user.username === credentials.username &&
        user.password === credentials.password
    );

    if (foundUser) {
      setLoginStatus("success");
      localStorage.setItem("isAdminLoggedIn", "true");
      setTimeout(() => {
        navigate("/admin/dashboard"); // ✅ go to AdminPanel
      }, 800);
    } else {
      setLoginStatus("error");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        background: "linear-gradient(to right, #fff, #f8f8f8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: { xs: "90%", sm: "400px" },
          borderRadius: "20px",
          textAlign: "center",
          backgroundColor: "#fff",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: "bold",
            color: "#cc1d2e",
            letterSpacing: 1,
          }}
        >
          Admin Login
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            variant="outlined"
            value={credentials.username}
            onChange={handleChange}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
            required
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={credentials.password}
            onChange={handleChange}
            required
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#cc1d2e",
              color: "white",
              py: 1.3,
              fontWeight: "bold",
              borderRadius: "25px",
              textTransform: "none",
              fontSize: "16px",
              "&:hover": { backgroundColor: "#a81825" },
            }}
          >
            Login
          </Button>
        </form>

        {loginStatus === "success" && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Login Successful!
          </Alert>
        )}
        {loginStatus === "error" && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Invalid Username or Password
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default AdminLogin;
