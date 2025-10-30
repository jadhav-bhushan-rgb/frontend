import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-[#002C5B] text-white py-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="blueprint" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint)" />
        </svg>
      </div>
      <div className="relative w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
          {/* Left Section - Company Info & Newsletter */}
          <div className=''>
            <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
              <img 
                src="https://www.247cutbend.in/assets/img/logo%20(2).png" 
                alt="247CUTBEND Logo" 
                className="h-16 w-auto mr-3 bg-white"
              />
            </Link>
            </div>
            </div>
            
            <p className="text-blue-100 mb-6 leading-relaxed">
              247Cutbend, your trusted partner for precision cutting, bending, and metal fabrication services. 
              With advanced technology and a commitment to quality.
            </p>

            <div>
              <h4 className="text-lg font-semibold mb-4">Subscribe Our Newsletter</h4>
              <div className="flex">
                <div className="relative flex-1">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-white rounded-l-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <button className="bg-yellow-500 text-black px-4 py-2 rounded-r-lg hover:bg-yellow-600 transition-colors flex items-center">
                  Subscribe
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Middle Section - Quick Links */}
              <div>
            <h4 className="text-lg font-semibold mb-4 relative">
              Quick Link
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-yellow-500"></div>
            </h4>
            <ul className="space-y-3 mt-6">
              <li><Link to="/about" className="text-blue-100 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="text-blue-100 hover:text-white transition-colors">Blogs</Link></li>
              <li><Link to="/faq" className="text-blue-100 hover:text-white transition-colors">Faqs</Link></li>
              <li><Link to="/terms" className="text-blue-100 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-blue-100 hover:text-white transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>

          {/* Right Section - Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 relative">
              Get In Touch
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-yellow-500"></div>
            </h4>
            <div className="space-y-4 mt-6">
              <div className="flex items-start">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-100 font-medium">Our Address:</p>
                  <p className="text-blue-100">578-587 Savli GIDC Rd, Vadodara, Manjusar, Gujarat 391770, India</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <PhoneIcon className="w-3 h-3 text-black" />
            </div>
              <div>
                  <p className="text-blue-100 font-medium">Call Us:</p>
                  <p className="text-blue-100">+91 95120 41116</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <EnvelopeIcon className="w-3 h-3 text-black" />
                </div>
                <div>
                  <p className="text-blue-100 font-medium">Mail Us:</p>
                  <p className="text-blue-100">jobshop@247cutbend.in</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        {/* <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"> */}
          {/* <p className="text-blue-100 text-sm">
            © Copyright 2025 Cutbend All Rights Reserved.
          </p> */}
          {/* <div className="flex space-x-4 mt-4 md:mt-0"> */}
            {/* WhatsApp */}
            {/* <a href="https://wa.me/919512041116" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </a> */}
            
            {/* Facebook */}
            {/* <a href="#" className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:bg-opacity-100 transition-colors">
              <span className="text-white text-xs font-bold">f</span>
            </a> */}
            
            {/* Twitter/X */}
            {/* <a href="#" className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:bg-opacity-100 transition-colors">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a> */}
            
            {/* LinkedIn */}
            {/* <a href="#" className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:bg-opacity-100 transition-colors">
              <span className="text-white text-xs font-bold">in</span>
            </a> */}
            
            {/* YouTube */}
            {/* <a href="#" className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:bg-opacity-100 transition-colors">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a> */}
            
            {/* Scroll to Top */}
            {/* <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors"
            >
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button> */}
          {/* </div>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
