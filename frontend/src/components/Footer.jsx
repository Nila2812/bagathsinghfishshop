import React from "react";
import {
  Box,
  Grid,
  Typography,
  Link as MuiLink,
  Stack,
  IconButton,
} from "@mui/material";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./LanguageContext";

const Footer = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const tamilFont = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
  const englishFont = "'Poppins', 'Lato', sans-serif";

  const getFont = () => (language === "TA" ? tamilFont : englishFont);

  const menuItems =
    language === "TA"
      ? [
          { label: "முகப்பு", path: "/" },
          { label: "வகைகள்", path: "/#shopByCategory" },
          { label: "பொருட்கள்", path: "/products" },
          { label: "கேள்விகள்", path: "/faq" },
          { label: "எங்களை பற்றி", path: "/about" },
        ]
      : [
          { label: "Home", path: "/" },
          { label: "Categories", path: "/#shopByCategory" },
          { label: "Shop Products", path: "/products" },
          { label: "FAQ", path: "/faq" },
          { label: "Contact Us", path: "/contact" },
          { label: "About Us", path: "/about" },
        ];

  return (
    <Box
      sx={{
        backgroundColor: "#171616",
        color: "#fdfdfd",
        pt: 4,
        fontFamily: getFont(),

      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Grid
          container
          spacing={{ xs: 4, sm: 4, md: 7}}
          sx={{
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {/* LEFT COLUMN */}
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            sx={{
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: { xs: "center", md: "center" },
              }}
            >
              <Box
                component="img"
                src="../src/img/logocon.jpg"
                alt="Logo"
                sx={{ width: 120 }}
              />
            </Box>

            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              {language === "TA" ? (
                <>
                  புல்கிஷ்பேகாம் காம்ப்ளெக்ஸ்,<br />
                  பஞ்சாயத்து அலுவலகம் அருகில், <br />
                  மெயின் ரோடு<br />
                  வடிப்பட்டி – 625218
                </>
              ) : (
                <>
                  Bulgishbegam Complex,<br />
                  Near Panchayat Office, Main Road<br />
                  Vadipatty - 625218
                </>
              )}
            </Typography>
          </Grid>

          {/* CENTER COLUMN */}
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            sx={{
              textAlign: { xs: "center", md: "center" },
              pt: { xs: 0, md: 6 },
              px:{xs:0,md:3},
              borderLeft: {
                xs: "none",
                sm: "none",
                md: "1px solid #515050",
              },
            }}
          >
            <Grid container spacing={2.5} justifyContent="center">
              {menuItems.map((item) => (
                <Grid item xs={4} sm={4} md={4} key={item.label}>
                  <MuiLink
                    underline="none"
                    href={item.path}
                    onClick={(e) => {
                      if (item.path.startsWith("/#")) {
                        e.preventDefault();
                        const id = item.path.replace("/#", "");
                        const element = document.getElementById(id);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        } else {
                          navigate("/", { state: { scrollTo: id } });
                        }
                      }
                    }}
                    sx={{
                      fontSize: "0.85rem",
                      color: "#fff",
                      "&:hover": { color: "#cb453e" },
                    }}
                  >
                    {item.label}
                  </MuiLink>
                </Grid>
              ))}
            </Grid>

            <Typography
              variant="body2"
              sx={{ mt: 2, lineHeight: 1.7, fontSize: "0.85rem" }}
            >
              {language === "TA" ? (
                <>
                  தினசரி மீன், கோழி, மட்டன் –
                  <br />
                  உங்கள் வீடு வரை டெலிவரி!
                </>
              ) : (
                <>
                  Order your daily Fish, Poultry and Mutton.
                  <br />
                  Delivered to your doorstep.
                </>
              )}
            </Typography>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid
            item
            xs={12}
            sm={12}
            md={4}
            sx={{
              textAlign: { xs: "center", md: "center" },
              borderLeft: {
                xs: "none",
                sm: "none",
                md: "1px solid #515050",
              },
              pl: { md: 9 },
              pt: { xs: 1, md: 5 },
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 1, fontWeight: 600, textAlign: { xs: "center", md: "center" } }}
            >
              {language === "TA" ? "தொடர்பு கொள்ள" : "Contact Us"}
            </Typography>

            <Typography variant="body2">+91 9150647008</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              bagathsinghfish.shop@gmail.com
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 1, textAlign: { xs: "center", md: "center" } }}
            >
              {language === "TA" ? "பின்தொடரவும்" : "Follow Us"}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              justifyContent={{ xs: "center", md: "center" }}
            >
              <IconButton sx={{ color: "#1877F2" }}>
                <FacebookIcon />
              </IconButton>
              <IconButton sx={{ color: "#1DA1F2" }}>
                <TwitterIcon />
              </IconButton>
              <IconButton sx={{ color: "#E4405F" }}>
                <InstagramIcon />
              </IconButton>
              <IconButton sx={{ color: "#FF0000" }}>
                <YouTubeIcon />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* COPYRIGHT */}
      <Box
        sx={{
          background: "linear-gradient(0deg, #646363 0%, #171616 100%)",
          color: "#fff",
          py: 1,
          textAlign: "center",
          fontFamily: getFont(),
          mt: 3,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
          © {new Date().getFullYear()}{" "}
          {language === "TA"
            ? "Bagathsingh Fish & Poultry. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை."
            : "Bagathsingh Fish & Poultry. All Rights Reserved."}
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
