import api from "../utils/api";  // Import the API client

export const fetchUserData = async () => {
    try {
        const response = await api.get("/auth/me");  // API call (token included automatically)
        console.log("User Data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};
