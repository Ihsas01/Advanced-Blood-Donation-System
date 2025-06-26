import React, { useState } from 'react';
import { Button, Spinner, TextInput, Textarea } from 'flowbite-react';
import { toast } from 'react-toastify';
import map from '../assets/map.jpg';
import contactus from '../assets/contactus.jpg';
import { useInquiry } from '../hooks/useinquiry';
import { HiCheckCircle } from 'react-icons/hi';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
    category: 'General',
  });
  const [errors, setErrors] = useState({});
  const { createInquiry, loading } = useInquiry();
  const [success, setSuccess] = useState(false);

  const categories = ['General', 'Technical', 'Complaint', 'Other'];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.message) newErrors.message = 'Message is required';
    if (!categories.includes(formData.category)) newErrors.category = 'Invalid category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    try {
      await createInquiry(formData);
      setSuccess(true);
      toast.success('Message sent successfully!');
      setFormData({ email: '', subject: '', message: '', category: 'General' });
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error sending message');
    }
  };

  return (
    <div className="min-h-screen py-16 bg-gradient-to-br from-colour1 via-white to-colour4 relative flex items-center justify-center animate-fade-in">
      <img src={contactus} alt="Contact Us" className="absolute inset-0 w-full h-full object-cover object-center opacity-40 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-colour1/60 to-colour4/40 z-10" />
      <div className="container mx-auto px-6 relative z-20">
        <h1 className="text-5xl font-extrabold text-center text-colour4 mb-12 animate-fade-in-up drop-shadow-xl">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="sexy-card bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-10 flex flex-col justify-center animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-6 animate-fade-in-up">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-white/90 mb-2 font-semibold">Email</label>
                <TextInput
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  required
                  disabled={loading}
                  color={errors.email ? 'failure' : 'gray'}
                  className="focus:ring-2 focus:ring-colour3"
                />
                {errors.email && <p className="text-red-300 text-sm mt-1 animate-fade-in-up">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="subject" className="block text-white/90 mb-2 font-semibold">Subject</label>
                <TextInput
                  id="subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  required
                  disabled={loading}
                  color={errors.subject ? 'failure' : 'gray'}
                  className="focus:ring-2 focus:ring-colour3"
                />
                {errors.subject && <p className="text-red-300 text-sm mt-1 animate-fade-in-up">{errors.subject}</p>}
              </div>
              <div>
                <label htmlFor="message" className="block text-white/90 mb-2 font-semibold">Message</label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Your Message"
                  required
                  disabled={loading}
                  color={errors.message ? 'failure' : 'gray'}
                  className="focus:ring-2 focus:ring-colour3"
                />
                {errors.message && <p className="text-red-300 text-sm mt-1 animate-fade-in-up">{errors.message}</p>}
              </div>
              <div>
                <label htmlFor="category" className="block text-white/90 mb-2 font-semibold">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-colour3 bg-white/80 text-colour4 font-semibold"
                  required
                  disabled={loading}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-300 text-sm mt-1 animate-fade-in-up">{errors.category}</p>}
              </div>
              <Button
                type="submit"
                className="w-full bg-colour3 hover:bg-colour2 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-colour2/40 animate-fade-in-up"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
              {success && (
                <div className="flex flex-col items-center justify-center animate-fade-in-up mt-4">
                  <HiCheckCircle className="text-green-400 text-5xl mb-2 animate-fade-in-up" />
                  <span className="text-green-200 font-semibold">Thank you! Your message has been sent.</span>
                </div>
              )}
            </form>
          </div>
          {/* Location Card */}
          <div className="sexy-card bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-10 flex flex-col justify-center animate-fade-in-up delay-100">
            <h2 className="text-2xl font-bold text-white mb-6 animate-fade-in-up">Our Location</h2>
            <p className="text-white/90 mb-2">BOC Merchant Tower, 28 St Michaels Rd</p>
            <p className="text-white/90 mb-2">Email: <span className="underline">redDrop@gmail.com</span></p>
            <p className="text-white/90 mb-6">Phone: <span className="underline">+1 (123) 456-7890</span></p>
            <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden shadow-xl animate-fade-in-up">
              <img
                src={map}
                alt="Location Map"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}