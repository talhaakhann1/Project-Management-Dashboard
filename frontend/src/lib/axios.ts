import axios from "axios";

const api=axios.create({
    baseURL:process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // Send cookies (refresh token, session, etc.)
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

export default api