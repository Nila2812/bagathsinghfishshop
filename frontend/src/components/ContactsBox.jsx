import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";

const ContactsBox = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const phoneNumber = "+91 91506 47008";
  const email = "bagathsinghfish.shop@gmail.com";

  const handleCallClick = () => {
    if (isMobile) {
      window.location.href = `tel:+${phoneNumber}`;
    } else {
      alert("📱 Call feature available only on mobile devices.");
    }
  };

  const handleWhatsAppClick = () => {
    if (isMobile) {
      window.location.href = `https://wa.me/${phoneNumber}`;
    } else {
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}`, "_blank");
    }
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${email}`;
  };

  const contactItems = [
    {
      title: "Call Us",
      icon: <PhoneIcon sx={{ fontSize: { xs: 50, md: 70 }, color: "#0078ff" }} />,
      text: "+91 91506 47008",
      onClick: handleCallClick,
    },
    {
      title: "WhatsApp Us",
      icon: <WhatsAppIcon sx={{ fontSize: { xs: 50, md: 70 }, color: "#25D366" }} />,
      text: "+91 91506 47008",
      onClick: handleWhatsAppClick,
    },
    {
      title: "Email Us",
      icon: <EmailIcon sx={{ fontSize: { xs: 50, md: 70 }, color: "#EA4335" }} />,
      text: "bagathsinghfish.shop@gmail.com",
      onClick: handleEmailClick,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "center",
        alignItems: "center",
        gap: { xs: 3, md: 4 },
        flexWrap: "wrap",
      }}
    >
      {contactItems.map((item, index) => (
        <Box
          key={index}
          onClick={item.onClick}
          sx={{
            flex: 1,
            textAlign: "center",
            cursor: "pointer",
            p: { xs: 1, md: 2 },
            minWidth: { xs: "80%", md: "25%" },
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "14px",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "#7d221d",
              fontWeight: "bold",
              mb: 1,
              fontSize: { xs: "1.2rem", md: "1.6rem" },
            }}
          >
            {item.title}
          </Typography>

          <IconButton disableRipple>{item.icon}</IconButton>

          <Typography
            variant="h6"
            sx={{
              mt: 1,
              color: "#000",
              fontSize: { xs: "1rem", md: "1.2rem" },
              wordBreak: "break-word",
            }}
          >
            {item.text}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ContactsBox;
