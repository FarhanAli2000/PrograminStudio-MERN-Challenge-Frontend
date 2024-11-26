import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";  // Import PropTypes
// import './Auth.css';


const Auth = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/login" : "/register";
    try {
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, { email, password });
      if (isLogin) {
        console.log("Setting token:", data.token);  // Log the token to verify it's being set
        setToken(data.token);  // Set the token on login
      } else {
        alert("User registered successfully. Please log in.");
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + err.response.data);
    }
  };

  return (
    <div>
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Create an account" : "Back to login"}
      </button>
    </div>
  );
};

// Prop validation
Auth.propTypes = {
  setToken: PropTypes.func.isRequired,  // Ensure setToken is a function and required
};

export default Auth;
