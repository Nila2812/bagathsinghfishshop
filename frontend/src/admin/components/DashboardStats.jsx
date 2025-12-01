import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Chip,
} from "@mui/material";
import axios from "axios";
import LowStockTable from "../components/LowStockTable";

const statLabels = [
  { key: "products", label: "Total Products", icon: "🐟" },
  { key: "offers", label: "Total Offers", icon: "🎁" },
  { key: "categories", label: "Total Categories", icon: "📂" },
  { key: "orders", label: "Total Orders", icon: "📦" },
  { key: "customers", label: "Total Customers", icon: "👥" },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    pendingOrders: 0,
    pendingRefunds: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    axios
      .get("/api/dashboard/stats")
      .then((res) => {
        setStats(res.data);
        setLoadingStats(false);
      })
      .catch((err) => {
        console.error("Stats fetch error:", err);
        setLoadingStats(false);
      });

    // Fetch order summary
    axios
      .get("/api/dashboard/order-summary")
      .then((res) => {
        setOrderSummary(res.data);
        setLoadingOrders(false);
      })
      .catch((err) => {
        console.error("Order summary fetch error:", err);
        setLoadingOrders(false);
      });

    // Fetch top customers
    axios
      .get("/api/dashboard/top-customers")
      .then((res) => {
        setTopCustomers(res.data);
        setLoadingCustomers(false);
      })
      .catch((err) => {
        console.error("Top customers fetch error:", err);
        setLoadingCustomers(false);
      });
  }, []);

  if (loadingStats) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Main Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statLabels.map(({ key, label, icon }) => (
          <Grid item xs={12} sm={6} md={2.4} key={key}>
            <Card sx={{ bgcolor: "#fff", boxShadow: 2, borderRadius: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  {icon} {label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#D31032" }}>
                  {stats[key] || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Low Stock Alert */}
      <Box sx={{ mb: 3 }}>
        <LowStockTable />
      </Box>

      {/* Order Summary Cards */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        📊 Order Summary
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#fff3e0", boxShadow: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                📦 Pending Orders
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "#ff9800" }}>
                {loadingOrders ? <CircularProgress size={24} /> : orderSummary.pendingOrders || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#e3f2fd", boxShadow: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                💰 Pending Refunds
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "#2196f3" }}>
                {loadingOrders ? <CircularProgress size={24} /> : orderSummary.pendingRefunds || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#e8f5e9", boxShadow: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                ✅ Delivered
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "#4caf50" }}>
                {loadingOrders ? <CircularProgress size={24} /> : orderSummary.delivered || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#ffebee", boxShadow: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                ❌ Cancelled
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "#f44336" }}>
                {loadingOrders ? <CircularProgress size={24} /> : orderSummary.cancelled || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top 5 Customers Table */}
      <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            🏆 Top 5 Customers by Order Count
          </Typography>

          {loadingCustomers ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : topCustomers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No customer data available yet.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Customer Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mobile Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Order Count</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Total Amount (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCustomers.map((customer, index) => (
                    <TableRow key={customer.userId} hover>
                      <TableCell>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          sx={{
                            bgcolor:
                              index === 0
                                ? "#FFD700"
                                : index === 1
                                ? "#C0C0C0"
                                : index === 2
                                ? "#CD7F32"
                                : "#e0e0e0",
                            color: index < 3 ? "#000" : "inherit",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {customer.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                          {customer.phone}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Chip
                          label={customer.orderCount}
                          size="small"
                          sx={{
                            bgcolor: "#e3f2fd",
                            color: "#0277bd",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 700 }}>
                        ₹{customer.totalSpent}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;