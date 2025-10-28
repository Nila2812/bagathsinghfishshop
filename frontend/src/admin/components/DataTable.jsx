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
 */

const DataTable = ({ columns = [], rows = [], onEdit, onDelete, title }) => {
  // Add Edit/Delete Action column dynamically
  const actionColumn = {
    field: "actions",
    headerName: "Actions",
    width: 150,
    sortable: true,
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
    <Box
      sx={{
        height: "85vh",
        width: "auto",
        ml: "5%",
        mr: "3%",
        bgcolor: "white",
        borderRadius: 2,
        boxShadow: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {title && (
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            mt: 2,
            textAlign: "center",
            fontWeight: 700,
            color: "black",
          }}
        >
          {title}
        </Typography>
      )}

      <Box sx={{ flex: 1, overflowX: "auto", overflowY: "auto",  m:3 }}>
        <DataGrid
          rows={rows}
          columns={mergedColumns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          autoHeight={false}
          
          sx={{
            border: "1px solid #ccc",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "white",
              color: "black",
              fontWeight: "bold",
              borderBottom: "2px solid #ccc",
            },
            
            "& .MuiDataGrid-cell": {
              borderRight: "1px solid #ccc",
              color: "black",
              backgroundColor: "white",
            },
            "& .MuiDataGrid-row": {
              borderBottom: "1px solid #ccc",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "2px solid #ccc",
              backgroundColor: "#f5f5f5",
              position: "sticky",
              bottom: 0,
              zIndex: 2,
            },
            
            "& .MuiDataGrid-virtualScroller": {
              overflowY: "auto",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default DataTable;
