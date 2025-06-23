import axios from "axios";

const handleLogin = async () => {
  try {
    const res = await axios.get("https://emails-reader.onrender.com/");
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
