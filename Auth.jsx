import logo from '/assets/logo.png';
import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import './Auth.css';

const Auth = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/login" : "/register";
    try {
      const { data } = await axios.post(`https://programinstudio-mern-challenge-backend.onrender.com${endpoint}`, { email, password });
      if (isLogin) {
        console.log("Setting token:", data.token);
        setToken(data.token);
      } else {
        alert("User registered successfully. Please log in.");
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + err.response.data);
    }
  };

  return (
    <div className="login">
      <img src={logo} alt="App Logo" className="logo" />
      <h1>Welcome to iTunes Movies</h1>
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
        <div className="button-row">
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Create an account" : "Back to login"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Prop validation
Auth.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Auth;
