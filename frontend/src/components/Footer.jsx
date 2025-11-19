import React from "react";
import {
  Box,
  Grid,
  Typography,
  Link,
  IconButton,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";

import { useLanguage } from "./LanguageContext";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { language } = useLanguage();
  const navigate = useNavigate();

  // ---------------------------------------------
  // ROUTE NAVIGATION LINK CONFIG
  // ---------------------------------------------
  const linkRoutes = {
    EN: [
      { label: "Home", route: "/" },
      { label: "Categories", route: "/" },
      { label: "Shop Products", route: "/products" },
      { label: "FAQ", route: "/" },
      { label: "About Us", route: "/about" },
    ],
    TA: [
      { label: "முகப்பு", route: "/" },
      { label: "வகைகள்", route: "/categories" },
      { label: "தயாரிப்புகள்", route: "/products" },
      { label: "எஃப்க்யூ", route: "/faq" },
      { label: "எங்களை பற்றி", route: "/about" },
    ],
  };

  const texts = {
    EN: {
      title: "Bagathsingh Fish & Poultry",
      address1: "Bulghisbegam Complex,",
      address2: "Near Panchayat Office, Main Road,",
      address3: "Vadipatty – 625218",
      quickLinks: "Quick Links",
      contact: "Contact Us",
      followUs: "Follow Us",
    },

    TA: {
      title: "பாகத்சிங் மீன் & கோழி கடை",
      address1: "புல்கிஸ் பேகம் காம்ப்ளெக்ஸ்,",
      address2: "பஞ்சாயத்து அலுவலகம் அருகில், மெயின் ரோடு,",
      address3: "வடியப்பட்டி – 625218",
      quickLinks: "விரைவு இணைப்புகள்",
      contact: "எங்களை தொடர்பு கொள்ள",
      followUs: "எங்களை பின்தொடருங்கள்",
    },
  };

  const t = texts[language];
  const menu = linkRoutes[language];

  // SOCIAL LINKS
  const socialLinks = {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
  };

  // CONTACT ACTIONS
  const callNumber = "tel:+919150647008";
  const emailLink = "mailto:bagathsinghfish.shop@gmail.com";

  return (
    <Box sx={{ bgcolor: "#181818ff", color: "#fff", mt: 5, pt: 6, pb: 3 }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
        
        {/* ------------------ MOBILE ACCORDION ------------------ */}
        {isMobile && (
          <>
            {/* ADDRESS (Always Visible) */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {t.title}
              </Typography>

              <Stack direction="row" spacing={1}>
                <LocationOnIcon sx={{ color: "#ccc" }} />
                <Typography sx={{ color: "#ccc" }}>
                  {t.address1} <br />
                  {t.address2} <br />
                  {t.address3}
                </Typography>
              </Stack>
            </Box>

            <Divider sx={{ borderColor: "#555", mb: 2 }} />

            {/* Quick Links Accordion */}
            <Accordion
              sx={{
                bgcolor: "transparent",
                color: "#fff",
                boxShadow: "none",
                borderBottom: "1px solid #555",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}>
                <Typography sx={{ fontWeight: 600 }}>{t.quickLinks}</Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={1}>
                  {menu.map((item) => (
                    <Typography
                      key={item.label}
                      sx={{
                        cursor: "pointer",
                        color: "#ccc",
                        "&:hover": { color: "#fff" },
                      }}
                      onClick={() => navigate(item.route)}
                    >
                      {item.label}
                    </Typography>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Contact Accordion */}
            <Accordion
              sx={{
                bgcolor: "transparent",
                color: "#fff",
                boxShadow: "none",
                borderBottom: "1px solid #555",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}>
                <Typography sx={{ fontWeight: 600 }}>{t.contact}</Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneIcon sx={{ color: "#ccc" }} />
                    <Link href={callNumber} sx={{ color: "#ccc" }}>
                      +91 9150647008
                    </Link>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailIcon sx={{ color: "#ccc" }} />
                    <Link href={emailLink} sx={{ color: "#ccc" }}>
                      bagathsinghfish.shop@gmail.com
                    </Link>
                  </Stack>
                </Stack>

                <Typography variant="h6" sx={{ fontWeight: 600, mt: 3 }}>
                  {t.followUs}
                </Typography>

                <Stack direction="row" spacing={2} mt={1}>
                  <IconButton href={socialLinks.facebook} target="_blank">
                    <FacebookIcon sx={{ color: "#1877F2" }} />
                  </IconButton>

                  <IconButton href={socialLinks.instagram} target="_blank">
                    <InstagramIcon sx={{ color: "#E4405F" }} />
                  </IconButton>

                  <IconButton href={socialLinks.youtube} target="_blank">
                    <YouTubeIcon sx={{ color: "#FF0000" }} />
                  </IconButton>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </>
        )}

        {/* ------------------ DESKTOP VIEW ------------------ */}
        {!isMobile && (
          <>
            <Grid container spacing={5} justifyContent="space-between">
              {/* LEFT - Address */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {t.title}
                </Typography>

                <Stack direction="row" spacing={1}>
                  <LocationOnIcon sx={{ color: "#ccc" }} />
                  <Typography sx={{ color: "#ccc" }}>
                    {t.address1} <br />
                    {t.address2} <br />
                    {t.address3}
                  </Typography>
                </Stack>
              </Grid>

              {/* QUICK LINKS */}
              <Grid item xs={12} md={3}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {t.quickLinks}
                </Typography>

                <Stack spacing={1}>
                  {menu.map((item) => (
                    <Typography
                      key={item.label}
                      sx={{
                        cursor: "pointer",
                        color: "#ccc",
                        "&:hover": { color: "#fff" },
                      }}
                      onClick={() => navigate(item.route)}
                    >
                      {item.label}
                    </Typography>
                  ))}
                </Stack>
              </Grid>

              {/* Contact */}
              <Grid item xs={12} md={3}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {t.contact}
                </Typography>

                <Stack spacing={1}>
                  <Stack direction="row" spacing={1}>
                    <PhoneIcon sx={{ color: "#ccc" }} />
                    <Link href={callNumber} sx={{ color: "#ccc" }}>
                      +91 9150647008
                    </Link>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <EmailIcon sx={{ color: "#ccc" }} />
                    <Link href={emailLink} sx={{ color: "#ccc" }}>
                      bagathsinghfish.shop@gmail.com
                    </Link>
                  </Stack>
                </Stack>

                <Typography variant="h6" sx={{ fontWeight: 600, mt: 3 }}>
                  {t.followUs}
                </Typography>

                <Stack direction="row" spacing={2} mt={1}>
                  <IconButton href={socialLinks.facebook} target="_blank">
                    <FacebookIcon sx={{ color: "#1877F2" }} />
                  </IconButton>
                  <IconButton href={socialLinks.instagram} target="_blank">
                    <InstagramIcon sx={{ color: "#E4405F" }} />
                  </IconButton>
                  <IconButton href={socialLinks.youtube} target="_blank">
                    <YouTubeIcon sx={{ color: "#FF0000" }} />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4, borderColor: "#555" }} />
          </>
        )}

        {/* COPYRIGHT */}
        <Typography sx={{ textAlign: "center", color: "#ccc", fontSize: "14px", mt: 3 }}>
          © 2025 Bagathsingh Fish & Poultry — All Rights Reserved
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
