import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addUser } from '../../features/users/usersSlice';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    dispatch(addUser(form));
    navigate('/login'); // redirect ke login setelah register
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <input
        className="w-full mb-2 p-2 border rounded"
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        className="w-full mb-4 p-2 border rounded"
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">
        Register
      </button>
    </form>
  );
};

export default RegisterForm;