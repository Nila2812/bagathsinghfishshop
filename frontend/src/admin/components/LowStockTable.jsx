import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import axios from "axios";

const LowStockTable = () => {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/low-stock")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Low stock fetch error:", err));
  }, []);

  return (
    <Card sx={{ mt: 3, bgcolor: "#fff", boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>⚠️ Low Stock Alerts</Typography>
        {!products ? (
          <CircularProgress />
        ) : products.length === 0 ? (
          <Typography>No low stock products found.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Quantity</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{p.name_en}</TableCell>
                  <TableCell>{p.stockQty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockTable;
