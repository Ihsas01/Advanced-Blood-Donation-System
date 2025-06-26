import React, { useState } from "react";
import { Button, Card, Label, TextInput, Checkbox, Spinner } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { useSignin } from '../hooks/useSignin';
import { toast } from 'react-toastify';
import { HiEye, HiEyeOff } from 'react-icons/hi';

export default function DonorLogin() {
  const navigate = useNavigate();
  const { signinD, loading } = useSignin();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value.trim(),
    }));
    if (id !== 'rememberMe') setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      if (errors.email) toast.error(errors.email);
      if (errors.password) toast.error(errors.password);
      return;
    }
    try {
      await signinD(formData);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        (err.message === 'Network Error'
          ? 'Network error. Please check your connection.'
          : 'Login failed. Please try again.');
      handleErrorResponse(errorMsg);
    }
  };

  const handleErrorResponse = (errorMsg) => {
    const lowerMsg = errorMsg.toLowerCase();
    if (lowerMsg.includes('password')) {
      toast.error('Incorrect password. Please try again.');
      setErrors((prev) => ({ ...prev, password: 'Incorrect password' }));
    } else if (lowerMsg.includes('email') || lowerMsg.includes('user')) {
      toast.error('Email not found. Please check your email or register.');
      setErrors((prev) => ({ ...prev, email: 'Email not found' }));
    } else {
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-colour1 via-white to-colour4 animate-fade-in p-6">
      <div className="sexy-card bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-colour3/20 w-full max-w-md p-10 animate-fade-in-up">
        <Button
          onClick={() => navigate("/Hospital_login")}
          size="sm"
          className="absolute top-4 right-4 bg-colour3 hover:bg-colour2 text-white border-none focus:ring-4 focus:ring-colour2/40 transition-all duration-300 rounded-full z-10"
        >
          Hospital Login
        </Button>
        <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-colour4 to-colour3 bg-clip-text text-transparent mb-8 tracking-tight drop-shadow-md animate-fade-in-up">
          Donor Login
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label
              htmlFor="email"
              value="Email"
              className="text-colour4 font-semibold tracking-wide animate-fade-in-up"
            />
            <TextInput
              id="email"
              type="email"
              placeholder="donor@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              color={errors.email ? 'failure' : 'gray'}
              className="mt-2 rounded-xl border-colour3/30 focus:ring-2 focus:ring-colour3 focus:border-colour3 transition-all duration-300 bg-white/70 animate-fade-in-up"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1.5 font-medium animate-fade-in-up">
                {errors.email}
              </p>
            )}
          </div>
          <div className="relative">
            <Label
              htmlFor="password"
              value="Password"
              className="text-colour4 font-semibold tracking-wide animate-fade-in-up"
            />
            <TextInput
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
              color={errors.password ? 'failure' : 'gray'}
              className="mt-2 rounded-xl border-colour3/30 focus:ring-2 focus:ring-colour3 focus:border-colour3 transition-all duration-300 bg-white/70 animate-fade-in-up pr-12"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-4 top-10 text-colour3 hover:text-colour4 transition-colors duration-200 focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
            </button>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1.5 font-medium animate-fade-in-up">
                {errors.password}
              </p>
            )}
          </div>
          <div className="flex items-center animate-fade-in-up">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 text-colour3 focus:ring-colour3 border-colour3/30 rounded"
            />
            <Label
              htmlFor="rememberMe"
              className="ml-2 text-sm font-medium text-colour4"
            >
              Remember me
            </Label>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full bg-colour3 hover:bg-colour2 text-white font-bold rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-colour2/40 animate-fade-in-up disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
          <p className="text-center text-sm text-colour4 font-medium animate-fade-in-up">
            Don't have an account?{' '}
            <button
              onClick={() => navigate("/register")}
              className="text-colour3 font-semibold hover:text-colour4 transition-colors duration-200"
              disabled={loading}
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}