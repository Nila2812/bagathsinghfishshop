import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/**
 * Props:
 * - language: "en" | "ta"
 * Example: <FAQSection language={language} />
 */

const FAQSection = ({ language = "en" }) => {
  const faqs = [
    {
      en: {
        question: "How can I register or log in?",
        answer:
          "Customers can log in using their phone number. An OTP will be sent for verification. Once verified, you can fill in your name and delivery address (either by selecting your location on the map or entering it manually).",
      },
      ta: {
        question: "பதிவு அல்லது உள்நுழைவு செய்வது எப்படி?",
        answer:
          "வாடிக்கையாளர்கள் தங்களது மொபைல் எண்ணை பயன்படுத்தி OTP மூலம் உள்நுழையலாம். சரிபார்ப்பு முடிந்த பிறகு, உங்கள் பெயர் மற்றும் முகவரியை வரைபடத்தில் தெரிவு செய்வதன் மூலம் அல்லது கைமுறையாக உள்ளிடலாம்.",
      },
    },
    {
      en: {
        question: "Can I order if I live more than 3 km away?",
        answer:
          "Currently, we deliver only within a 3 km radius of our shop. You can still browse products, but ordering will be disabled if your location is outside the delivery zone.",
      },
      ta: {
        question: "3 கிமீ தூரத்திற்கு அப்பால் நான் ஆர்டர் செய்ய முடியுமா?",
        answer:
          "தற்போது நாங்கள் கடையிலிருந்து 3 கிமீ சுற்றளவில் மட்டுமே டெலிவரி செய்கிறோம். நீங்கள் பொருட்களை பார்வையிடலாம், ஆனால் அந்த தூரத்திற்கு வெளியே ஆர்டர் செய்ய முடியாது.",
      },
    },
    {
      en: {
        question: "Will the product weight change after cleaning?",
        answer:
          "Yes. The displayed weight is before cleaning. Actual weight may reduce slightly after cleaning, depending on the fish or chicken variety.",
      },
      ta: {
        question: "சுத்தம் செய்த பிறகு பொருளின் எடை மாறுமா?",
        answer:
          "ஆம். காட்டப்படும் எடை சுத்தம் செய்யும்முன் எடை ஆகும். மீன் அல்லது கோழி வகைக்கு ஏற்ப சுத்தம் செய்த பிறகு சிறிதளவு எடை குறையலாம்.",
      },
    },
    {
      en: {
        question: "How can I contact the shop after placing an order?",
        answer:
          "Once your order is placed, details are automatically shared with the admin through WhatsApp. You can directly chat with us or receive order updates (like confirmation, estimated delivery time, etc.) on WhatsApp.",
      },
      ta: {
        question: "ஆர்டர் செய்த பிறகு கடையுடன் எப்படி தொடர்பு கொள்வது?",
        answer:
          "உங்கள் ஆர்டர் வைக்கப்பட்டவுடன், விவரங்கள் தானாகவே WhatsApp மூலம் நிர்வாகிக்கு அனுப்பப்படும். நீங்கள் நேரடியாக எங்களுடன் பேசலாம் அல்லது ஆர்டர் அப்டேட்களை (உறுதிப்படுத்தல், டெலிவரி நேரம் போன்றவை) WhatsApp-ல் பெறலாம்.",
      },
    },
    {
      en: {
        question: "Can I modify or cancel my order after placing it?",
        answer:
          "If your order has not yet been confirmed, you can contact us immediately via WhatsApp to request a modification or cancellation.",
      },
      ta: {
        question: "ஆர்டர் வைத்த பிறகு அதை மாற்றவோ ரத்துசெய்யவோ முடியுமா?",
        answer:
          "உங்கள் ஆர்டர் இன்னும் உறுதிசெய்யப்படவில்லை என்றால், உடனடியாக WhatsApp மூலம் எங்களை தொடர்பு கொண்டு மாற்றம் அல்லது ரத்துசெய்தல் கோரலாம்.",
      },
    },
    {
      en: {
        question: "How will I know if my order is confirmed?",
        answer:
          "Once the admin reviews your order, you’ll receive a WhatsApp message confirming your order, along with estimated delivery time or updates like 'Out for Delivery'.",
      },
      ta: {
        question: "என் ஆர்டர் உறுதிசெய்யப்பட்டதா என்று எப்படி தெரியும்?",
        answer:
          "நிர்வாகி உங்கள் ஆர்டரை பரிசீலித்தவுடன், ஆர்டர் உறுதிசெய்யப்பட்டதாகவும், டெலிவரி நேரம் போன்ற தகவல்களும் கொண்ட WhatsApp செய்தி உங்களுக்கு அனுப்பப்படும்.",
      },
    },
    {
      en: {
        question: "How do offers and discounts work?",
        answer:
          "Offers are displayed under the 'Today's Offers' section. They are managed by the admin and may include discounts on sea fish, live fish, or special products. Offer details such as price, percentage, and description will be shown on the product.",
      },
      ta: {
        question: "ஆஃபர்கள் மற்றும் தள்ளுபடிகள் எப்படி செயல்படுகின்றன?",
        answer:
          "'இன்றைய ஆஃபர்கள்' பகுதியில் ஆஃபர்கள் காணப்படும். அவை நிர்வாகியால் நிர்வகிக்கப்படுகின்றன மற்றும் கடல் மீன், லைவ் மீன் அல்லது சிறப்பு பொருட்களுக்கு தள்ளுபடிகள் உள்ளடக்கலாம். விலை, சதவீதம், விளக்கம் போன்ற விவரங்கள் பொருளில் காட்டப்படும்.",
      },
    },
    {
      en: {
        question: "What are the available payment options?",
        answer:
          "We offer two payment methods: Online Payment via Razorpay and Cash on Delivery (COD).",
      },
      ta: {
        question: "கட்டண முறைகள் என்னென்ன?",
        answer:
          "நாங்கள் இரண்டு கட்டண முறைகளை வழங்குகிறோம்: Razorpay மூலம் ஆன்லைன் கட்டணம் மற்றும் வீட்டிலேயே பணம் கொடுத்து வாங்கும் (COD).",
      },
    },
    {
      en: {
        question: "Is there a delivery charge?",
        answer:
          "Yes, delivery charge is based on your order total:\n• Below ₹200 – ₹40\n• ₹200–₹500 – ₹30\n• ₹500–₹1000 – ₹20\n• Above ₹1000 – Free delivery",
      },
      ta: {
        question: "டெலிவரி கட்டணம் உள்ளதா?",
        answer:
          "ஆம், டெலிவரி கட்டணம் உங்கள் ஆர்டர் தொகைக்கு ஏற்ப நிர்ணயிக்கப்படும்:\n• ₹200 கீழே – ₹40\n• ₹200–₹500 – ₹30\n• ₹500–₹1000 – ₹20\n• ₹1000 மேல் – இலவச டெலிவரி",
      },
    },
  ];

  const tamilFontFamily = "'Latha', 'Noto Sans Tamil', 'Tiro Tamil', sans-serif";
  const englishFontFamily = "'Poppins', 'Lato', 'Helvetica Neue', sans-serif";

  return (
    <Box
      sx={{
        backgroundColor: "#fafafa",
        py: { xs: 4, md: 8 },
        px: { xs: 2, sm: 4, md: 8 },
        transition: "font-family 0.3s ease",
        fontFamily: language === "ta" ? tamilFontFamily : englishFontFamily,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          fontWeight: 700,
          mb: 4,
          color: "#4E2C1E",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontFamily: language === "ta" ? tamilFontFamily : englishFontFamily,
        }}
      >
        {language === "ta"
          ? "அடிக்கடி கேட்கப்படும் கேள்விகள்"
          : "Frequently Asked Questions"}
      </Typography>

      {faqs.map((faq, index) => (
        <Accordion
          key={index}
          sx={{
            mb: 1.5,
            borderRadius: "8px",
            boxShadow: "0px 3px 8px rgba(0,0,0,0.08)",
            "&:before": { display: "none" },
            overflow: "hidden",
            transition: "0.2s ease",
            "&:hover": {
              transform: "scale(1.01)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#7B4B2A" }} />}
            sx={{
              backgroundColor: "#fff",
              "&:hover": { backgroundColor: "#f9f4f0" },
              fontFamily:
                language === "ta" ? tamilFontFamily : englishFontFamily,
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: { xs: "0.9rem", md: "1rem" },
                color: "#3C1E0A",
              }}
            >
              {language === "ta" ? faq.ta.question : faq.en.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              backgroundColor: "#fff",
              color: "#555",
              fontSize: { xs: "0.85rem", md: "0.95rem" },
              lineHeight: 1.6,
              whiteSpace: "pre-line",
              fontFamily:
                language === "ta" ? tamilFontFamily : englishFontFamily,
            }}
          >
            {language === "ta" ? faq.ta.answer : faq.en.answer}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FAQSection;
