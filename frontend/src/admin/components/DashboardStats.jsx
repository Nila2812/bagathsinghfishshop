import React, { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import axios from "axios";

const statLabels = [
  { key: "products", label: "Total Products", icon: "🐟" },
  { key: "offers", label: "Total Offers", icon: "🎁" },
  { key: "categories", label: "Total Categories", icon: "📂" },
 // { key: "customers", label: "Total Customers", icon: "👥" },
  { key: "orders", label: "Total Orders", icon: "📦" },
];

const DashboardStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Stats fetch error:", err));
  }, []);

  if (!stats) return null;

  return (
    <Grid container spacing={2}>
      {statLabels.map(({ key, label, icon }) => (
        <Grid item xs={12} sm={6} md={3} key={key}>
          <Card sx={{ bgcolor: "#fff", boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6">{icon} {label}</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>{stats[key]}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardStats;