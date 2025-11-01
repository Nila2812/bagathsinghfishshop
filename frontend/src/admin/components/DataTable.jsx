import React from "react";
import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const DataTable = ({ columns = [], rows = [], onEdit, onDelete, title }) => {
  const actionColumn = {
    field: "actions",
    headerName: "Actions",
    width: 150,
    sortable: false,
    renderCell: (params) => (
      <Box>
        <Tooltip title="Edit">
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit && onEdit(params.row._id)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this item?")) {
                onDelete && onDelete(params.row._id);
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  const mergedColumns = [...columns, actionColumn];

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "white",
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {title && (
        <Typography
          variant="h5"
          sx={{
            
            textAlign: "center",
            fontWeight: 600,
            color: "#333",
            textTransform: "camelcase" ,
            py: 2,
            borderBottom: "1px solid #ddd",
          }}
        >
          {title}
        </Typography>
      )}

      {/* Scroll only table rows */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1 }}>
        <DataGrid
          rows={rows}
          columns={mergedColumns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#fafafa",
              borderBottom: "2px solid #ccc",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #eee",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "2px solid #ccc",
              backgroundColor: "#fafafa",
              position: "sticky",
              bottom: 0,
              zIndex: 2,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default DataTable;
