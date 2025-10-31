import React from "react";
import {
  Box,
  Grid,
  Typography,
  Link as MuiLink,
  TextField,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#111",
        color: "#fff",
        pt: 6,
        pb: 2,
        px: { xs: 3, sm: 6, md: 5 },
        mt: 6,
        md:0,
        fontFamily: `'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
      }}
    >
      {/* === TOP FOOTER GRID === */}
      <Grid container spacing={5} justifyContent="center">
        {/* COMPANY INFO */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            component="img"
            src="src/img/logocon.jpg"
            alt="Logo"
            sx={{ width: 70, height: 70, mb: 1 }}
          />
          <Typography variant="body2" sx={{ lineHeight: 1.6, mb: 2 }}>
            Fresh seafood delivered to your doorstep. Quality you can trust,
            taste you’ll love.
          </Typography>
          <Typography variant="body2">📍 Thoothukudi, Tamil Nadu</Typography>
          <Typography variant="body2">📞 +91 98765 43210</Typography>
          <Typography variant="body2">✉️ contact@fishmarket.in</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <IconButton color="inherit" size="small">
              <FacebookIcon />
            </IconButton>
            <IconButton color="inherit" size="small">
              <InstagramIcon />
            </IconButton>
            <IconButton color="inherit" size="small">
              <TwitterIcon />
            </IconButton>
            <IconButton color="inherit" size="small">
              <YouTubeIcon />
            </IconButton>
          </Stack>
        </Grid>

        {/* QUICK LINKS */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#cc1d2e", fontWeight: 600 }}
          >
            Quick Links
          </Typography>
          <Stack spacing={1}>
            {/* ✅ Use React Router for navigation */}
            <MuiLink
              component={RouterLink}
              to="/"
              underline="none"
              color="inherit"
              sx={{ "&:hover": { color: "#cc1d2e" }, fontSize: "0.95rem" }}
            >
              Home
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/about"
              underline="none"
              color="inherit"
              sx={{ "&:hover": { color: "#cc1d2e" }, fontSize: "0.95rem" }}
            >
              About Us
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/contact"
              underline="none"
              color="inherit"
              sx={{ "&:hover": { color: "#cc1d2e" }, fontSize: "0.95rem" }}
            >
              Contact Us
            </MuiLink>

            {/* Keep static links as placeholders */}
            <MuiLink
              href="#"
              underline="none"
              color="inherit"
              sx={{ "&:hover": { color: "#cc1d2e" }, fontSize: "0.95rem" }}
            >
              Shop
            </MuiLink>
            <MuiLink
              href="#"
              underline="none"
              color="inherit"
              sx={{ "&:hover": { color: "#cc1d2e" }, fontSize: "0.95rem" }}
            >
              Privacy Policy
            </MuiLink>
            <MuiLink
              href="#"
              underline="none"
              color="inherit"
              sx={{ "&:hover": { color: "#cc1d2e" }, fontSize: "0.95rem" }}
            >
              Terms & Conditions
            </MuiLink>
          </Stack>
        </Grid>

        {/* CUSTOMER SUPPORT */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#cc1d2e", fontWeight: 600 }}
          >
            Customer Support
          </Typography>
          <Stack spacing={1}>
            {[
              "FAQs",
              "Shipping & Delivery",
              "Return Policy",
              "Track Order",
              "Payment Options",
            ].map((text) => (
              <MuiLink
                key={text}
                href="#"
                underline="none"
                color="inherit"
                sx={{
                  "&:hover": { color: "#cc1d2e" },
                  fontSize: "0.95rem",
                }}
              >
                {text}
              </MuiLink>
            ))}
          </Stack>
        </Grid>

        {/* NEWSLETTER */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#cc1d2e", fontWeight: 600 }}
          >
            Stay Updated
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Subscribe to our newsletter for exclusive offers and fresh arrivals.
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              variant="filled"
              placeholder="Enter your email"
              size="small"
              InputProps={{
                disableUnderline: true,
                sx: {
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  color: "#000",
                },
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#cc1d2e",
                "&:hover": { backgroundColor: "#a21826" },
                textTransform: "none",
              }}
            >
              Subscribe
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* === BOTTOM BAR === */}
      <Box
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.2)",
          mt: 5,
          pt: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
          © {new Date().getFullYear()} FishMarket. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
