import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_DEPLOYED_API_BASE_URL

const TopNavService = {
  getNavbarItems: async () => {
    try {
      console.log("📡 Fetching navbar from:", `${API_BASE_URL}/api/navbar`);
      const res = await axios.get(`${API_BASE_URL}/api/navbar`, { withCredentials: true });

      if (res?.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }

      if (Array.isArray(res.data)) {
        return res.data;
      }

      return [];
    } catch (err) {
      if (err.response) {
        console.error("Server responded with:", err.response.data);
      }
      return [];
    }
  },
};

export default TopNavService;
