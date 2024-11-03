import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const { username, email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const body = JSON.stringify({ username, email, password });

    try {
      const res = await axios.post('http://localhost:8000/api/register/', body, config);
      console.log('Registration Successful:', res.data);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <>
    <Navbar />

    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Username"
        name="username"
        value={username}
        onChange={onChange}
        required
      />
      <input
        type="email"
        placeholder="Email"
        name="email"
        value={email}
        onChange={onChange}
        required
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        value={password}
        onChange={onChange}
        required
      />
      <button type="submit">Register</button>
    </form>
    </>
  );
};

export default Register;