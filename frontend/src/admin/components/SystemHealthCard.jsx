import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, CircularProgress, Box } from "@mui/material";
import axios from "axios";

const SystemHealthCard = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/system/health")
      .then((res) => setStatus(res.data))
      .catch(() => setStatus({ api: "offline", database: "error" }));
  }, []);

  return (
    <Card sx={{ bgcolor: "#fff", boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>⚙️ System Health</Typography>
        {!status ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <Typography>API: <strong style={{ color: status.api === "online" ? "green" : "red" }}>{status.api}</strong></Typography>
            <Typography>Database: <strong style={{ color: status.database === "connected" ? "green" : "red" }}>{status.database}</strong></Typography>
            <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
              Last checked: {new Date(status.timestamp).toLocaleString()}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
