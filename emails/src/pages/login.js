import axios from "axios";

const handleLogin = async () => {
  try {
    // Important: Add withCredentials: true to send cookies
    const res = await axios.get("http://localhost:3001/", {
      withCredentials: true
    });
    window.location.href = res.data.url;
  } catch (error) {
    console.error("Login error:", error);
  }
};

export default function Login() {
  return (
    <div>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}