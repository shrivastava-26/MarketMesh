import React, { useState, useContext } from "react";
import "./Form.scss";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../service/auth.service";
import { MeshContext } from "../../store/MeshContext";

const Form = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { setUser } = useContext(MeshContext);
  const navigate = useNavigate();

  const toggleHandler = () => setIsLogin(!isLogin);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await AuthService.login({
          email: formData.email,
          password: formData.password,
        });

        if (res.status === 200) {
          toast.success(`Welcome back, ${res.data.data.name || "User"}!`);
          setUser(res.data.data);
          navigate("/");
        }
      } else {
        const res = await AuthService.register(formData);

        if (res.status === 201) {
          toast.success("Registration successful! Please login.");
          setIsLogin(true);
          setFormData({ name: "", email: "", password: "" });
        } else {
          toast.info(res.data.message || "Registration failed");
          if (res.data.message === "User already exists") setIsLogin(true);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="form-container">
      <form className="auth-form" onSubmit={submitHandler}>
        <h2>{isLogin ? "Welcome Back" : "Join MarketMesh"}</h2>

        {!isLogin && (
          <>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={changeHandler}
              required
            />
          </>
        )}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={changeHandler}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={changeHandler}
          required
        />

        <p className="toggle-text" onClick={toggleHandler}>
          {isLogin
            ? "New user? Create account"
            : "Already have an account? Login"}
        </p>

        <div className="btn-group">
          <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
          <button
            type="reset"
            className="reset"
            onClick={() =>
              setFormData({ name: "", email: "", password: "" })
            }
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
