import API from "./api";

const adminService = {
  // 1. Dashboard aggregated metrics
  getDashboardStats: async () => {
    const response = await API.get("/admin/stats");
    return response.data?.data || response.data;
  },

  // 2. User directory with search, filter, pagination
  getUsers: async (params = {}) => {
    const response = await API.get("/admin/users", { params });
    return response.data;
  },

  // 3. Single user dossier (with crops, tasks, alerts)
  getUserById: async (id) => {
    const response = await API.get(`/admin/users/${id}`);
    return response.data;
  },

  // 4. Update user status
  updateUserStatus: async (id, status) => {
    const response = await API.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  // 5. Update user role
  updateUserRole: async (id, role) => {
    const response = await API.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // 6. Crops and Agricultural Diagnostics
  getCrops: async (params = {}) => {
    const response = await API.get("/admin/crops", { params });
    return response.data;
  },

  // 7. System alerts list
  getAlerts: async (params = {}) => {
    const response = await API.get("/admin/alerts", { params });
    return response.data;
  },

  // 8. Broadcast real alert to farmers in MongoDB
  broadcastAlert: async (data) => {
    const response = await API.post("/admin/alerts/broadcast", data);
    return response.data;
  },

  // 9. Delete an alert
  deleteAlert: async (id) => {
    const response = await API.delete(`/admin/alerts/${id}`);
    return response.data;
  },

  // 10. Database and System Health
  getSystemHealth: async () => {
    const response = await API.get("/admin/system-health");
    return response.data;
  },

  // 11. Reports and Real Database Analytics
  getReports: async (params = {}) => {
    const response = await API.get("/admin/reports", { params });
    return response.data;
  }
};

export default adminService;
