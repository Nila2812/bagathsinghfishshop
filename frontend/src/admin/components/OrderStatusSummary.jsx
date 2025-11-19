import React, { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import axios from "axios";

const statusLabels = [
  { key: "pending", label: "Pending", color: "#fbc02d" },
  { key: "delivered", label: "Delivered", color: "#4caf50" },
  { key: "cancelled", label: "Cancelled", color: "#f44336" },
];

const OrderStatusSummary = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/order-summary")
      .then((res) => setSummary(res.data))
      .catch((err) => console.error("Order summary fetch error:", err));
  }, []);

  if (!summary) return <CircularProgress />;

  return (
    <Grid container gap={2}>
      {statusLabels.map(({ key, label, color }) => (
        <Grid size={{ xs: 12, sm: 4 }} key={key}>
          <Card sx={{ bgcolor: "#fff", boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color }}>{label}</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>{summary[key]}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default OrderStatusSummary;
