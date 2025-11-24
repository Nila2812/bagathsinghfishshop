// utils/clientId.js

/**
 * Get or generate a unique client ID for guest users
 * This ID persists across page refreshes and is used for guest cart/address
 */
export const getClientId = () => {
  let clientId = localStorage.getItem("clientId");
  
  if (!clientId) {
    // Generate unique client ID: client_timestamp_randomstring
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("clientId", clientId);
  }
  
  return clientId;
};

/**
 * Clear client ID (useful when user logs in or logs out)
 */
export const clearClientId = () => {
  localStorage.removeItem("clientId");
};

/**
 * Generate a new client ID (useful after logout to start fresh)
 */
export const regenerateClientId = () => {
  const newClientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem("clientId", newClientId);
  return newClientId;
};