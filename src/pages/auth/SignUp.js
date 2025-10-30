import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    department: '',
    country: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== SIGNUP FORM SUBMITTED ===');
    console.log('Form data:', formData);
    
    // Check if all required fields are filled
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'phone', 'company', 'department', 'country'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Check password requirements
    const passwordRequirements = [
      { text: '8 characters', met: formData.password.length >= 8 },
      { text: '1 lowercase', met: /[a-z]/.test(formData.password) },
      { text: '1 uppercase', met: /[A-Z]/.test(formData.password) },
      { text: '1 digit', met: /\d/.test(formData.password) },
      { text: '1 special character (@$!%*?&)', met: /[@$!%*?&]/.test(formData.password) }
    ];
    
    const unmetRequirements = passwordRequirements.filter(req => !req.met);
    if (unmetRequirements.length > 0) {
      console.log('Password requirements not met:', unmetRequirements);
      toast.error('Password does not meet requirements');
      return;
    }

    setLoading(true);

    try {
      console.log('=== FORM DATA DEBUG ===');
      console.log('formData.phone:', formData.phone);
      console.log('formData.company:', formData.company);
      console.log('formData.department:', formData.department);
      console.log('formData.country:', formData.country);
      console.log('=== END FORM DATA DEBUG ===');
      
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phone,
        companyName: formData.company,
        department: formData.department,
        country: formData.country,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: formData.country
        }
      };
      
      console.log('Sending signup data:', signupData);
      console.log('Full signup data keys:', Object.keys(signupData));
      console.log('Address object:', signupData.address);
      console.log('🚀 CALLING API NOW...');
      const result = await signup(signupData);
      console.log('✅ API CALL COMPLETED!');
      console.log('Signup result:', result);
      
      if (result.success) {
        console.log('🎉 SUCCESS! Redirecting to dashboard...');
        toast.success('Account created successfully!');
        // Add a small delay so you can see the console messages
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        console.log('❌ API returned error:', result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { text: '8 characters', met: formData.password.length >= 8 },
    { text: '1 lowercase', met: /[a-z]/.test(formData.password) },
    { text: '1 uppercase', met: /[A-Z]/.test(formData.password) },
    { text: '1 digit', met: /\d/.test(formData.password) },
    { text: '1 special character (@$!%*?&)', met: /[@$!%*?&]/.test(formData.password) }
  ];

  return (
    <div className="min-h-screen flex p-5">
      {/* Left Column - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-3 px-6 sm:px-8 lg:px-12 xl:px-16 bg-white border-solid border-2 ">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between ">
            {/* <div className="flex items-center">
              <div className="h-8 w-8 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">CUTBEND</span>
            </div> */}
            {/* <div className="flex items-center space-x-4">
              <select className="text-sm border-none bg-transparent focus:outline-none text-gray-700">
                <option>English</option>
              </select>
            </div> */}
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sign Up to CUTBEND</h2>
            <p className="mt-3 text-base text-gray-600">
              Complete the form below to create your Cutbend account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="new-email"
                  required
                  className="mt-2 block w-full px-2.5 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                <p className="mt-2 text-xs text-gray-500">Please enter your corporate email. Hotmail is not accepted.</p>
              </div>

              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="mt-2 block w-full px-2.5 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="mt-2 block w-full px-2.5 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-2 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-2.5 py-2.5 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-base">
                    🇮🇳 +91
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="flex-1 block w-full px-2.5 py-2.5 border border-gray-300 rounded-none rounded-r-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company name
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  className="mt-2 block w-full px-2.5 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              {/* Department and Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    className="mt-2 block w-full px-2.5 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Design">Design</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country/Region
                  </label>
                  <select
                    id="country"
                    name="country"
                    required
                    className="mt-2 block w-full px-2.5 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="text-gray-400">👁️</span>
                  </button>
                </div>
                {/* Password Requirements */}
                <div className="mt-2 text-xs">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className={`flex items-center ${req.met ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-2">{req.met ? '✓' : '✗'}</span>
                      <span>{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="text-gray-400">👁️</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'SIGN UP'}
              </button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column - Company Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-yellow-100 flex-col justify-center px-12 py-16 relative">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Delivering Factory Direct Quality Sheet Metal Parts Since 2005
          </h2>
          <p className="text-gray-700 mb-10 text-lg">
            We focus on simplifying and expediting processes without compromising on quality and services
          </p>

          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">OUR EXPERTISE</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Laser Cutting', icon: '⚡' },
                { name: 'Surface Finishing', icon: '✨' },
                { name: 'Threading & Chamfering', icon: '🔩' },
                { name: 'Customer Fastener Bags', icon: '📦' },
                { name: 'Sheet Metal Bending', icon: '📐' },
                { name: 'Laser Engraving', icon: '🎨' },
                { name: 'Bulk Fasteners', icon: '🔧' },
                { name: 'CNC Turning', icon: '⚙️' }
              ].map((service) => (
                <div key={service.name} className="flex items-center text-gray-700 text-sm mb-2">
                  <span className="mr-3 text-gray-800 text-lg">{service.icon}</span>
                  <span>{service.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-yellow-200 rounded-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">JD</span>
              </div>
            </div>
            <p className="text-gray-700 italic mb-6 leading-relaxed text-sm">
              "We have been working with the Cutbend platform since its launch and have been very impressed with the quality of the fabrication, the lead times and ease of use of the platform."
            </p>
            <p className="text-gray-600 text-sm font-medium">
              Jonathan D.<br />
              <span className="text-gray-500">Head of Product Design, HivelQ / Form Studio</span>
            </p>
          </div>

          {/* Chat Button */}
          <div className="absolute bottom-12 right-12">
            <button className="bg-white text-green-600 px-2.5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
              Have a Question? Chat with us
            </button>
          </div>
        </div>
      </div>

      {/* Mobile version of company info */}
      <div className="lg:hidden bg-green-600 p-8 mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">
          Delivering Factory Direct Quality Sheet Metal Parts Since 2005
        </h2>
        <p className="text-green-100 mb-6">
          We focus on simplifying and expediting processes without compromising on quality and services
        </p>
        <h3 className="text-xl font-semibold text-white mb-6">OUR EXPERTISE</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Laser Cutting', icon: '⚡' },
            { name: 'Surface Finishing', icon: '✨' },
            { name: 'Threading & Chamfering', icon: '🔩' },
            { name: 'Customer Fastener Bags', icon: '📦' },
            { name: 'Sheet Metal Bending', icon: '📐' },
            { name: 'Laser Engraving', icon: '🎨' },
            { name: 'Bulk Fasteners', icon: '🔧' },
            { name: 'CNC Turning', icon: '⚙️' }
          ].map((service) => (
            <div key={service.name} className="flex items-center text-green-100 text-sm mb-2">
              <span className="mr-3 text-white text-lg">{service.icon}</span>
              <span>{service.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
