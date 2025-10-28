import React from "react";
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * DataTable Component
 * -------------------
 * Props:
 *  - columns: array of column definitions (for MUI DataGrid)
 *  - rows: array of data objects
 *  - onEdit: function(id) => handle edit action
 *  - onDelete: function(id) => handle delete action
 * 
 * Example usage:
 * <DataTable
 *   columns={productColumns}
 *   rows={productData}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */

const DataTable = ({ columns = [], rows = [], onEdit, onDelete, title }) => {
  // Add Edit/Delete Action column dynamically
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
            onClick={() => onEdit && onEdit(params.row.id)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete && onDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  const mergedColumns = [...columns, actionColumn];

  return (
    <Box sx={{ height: "75vh", width: "100%", bgcolor: "background.paper", p: 2, borderRadius: 2, boxShadow: 2 }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
      )}

      <DataGrid
        rows={rows}
        columns={mergedColumns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        disableSelectionOnClick
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#1976d2",
            color: "white",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
      />
    </Box>
  );
};

export default DataTable;
