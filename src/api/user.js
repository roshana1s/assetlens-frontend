import api from "../utils/api";  

export const fetchUserData = async () => {
    try {
        const response = await api.get("/auth/me");  
        console.log("User Data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

