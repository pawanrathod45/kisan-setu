import API from "./api";

/**
 * 🏛️ Scheme Service
 * Real-time API service for Maharashtra Government Schemes
 */
export const schemeService = {
  // Fetch all schemes with optional query filters
  getSchemes: async (params = {}) => {
    const res = await API.get("/schemes", { params });
    return res.data;
  },

  // Fetch schemes matched against the authenticated farmer's profile
  getMatchedSchemes: async () => {
    const res = await API.get("/schemes/matched/eligibility");
    return res.data;
  },

  // Fetch a single scheme by ID
  getSchemeById: async (id) => {
    const res = await API.get(`/schemes/${id}`);
    return res.data;
  },

  // Toggle bookmark/save for a scheme
  toggleBookmark: async (id) => {
    const res = await API.post(`/schemes/${id}/bookmark`);
    return res.data;
  },

  // Fetch all bookmarked schemes for current farmer
  getBookmarkedSchemes: async () => {
    const res = await API.get("/schemes/saved/bookmarks");
    return res.data;
  }
};

export default schemeService;
