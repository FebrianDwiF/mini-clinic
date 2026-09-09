import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const result = await response.json();

      console.log(result);

      if (result.success) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));

        console.log("TOKEN:", localStorage.getItem("token"));
        console.log("USER:", localStorage.getItem("user"));

        onLoginSuccess();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Tidak dapat terhubung ke server");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Mini Clinic</h1>
        <p>Information System</p>

        <form onSubmit={handleLogin}>
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
            />
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
