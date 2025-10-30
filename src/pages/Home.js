import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleUploadFiles = () => {
    if (user) {
      navigate('/inquiry/new');
    } else {
      navigate('/signup');
    }
  };

  // Sliding carousel data
  const slides = [
    {
      id: 1,
      title: "LASER CUTTING & BENDING - 24X7 ONLINE",
      mainText: ["Instant Quote", "Fastest Delivery", "Best Price"],
      backgroundImage: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      buttonText: "Upload Files"
    },
    {
      id: 2,
      title: "PRECISION MANUFACTURING SOLUTIONS",
      mainText: ["Advanced Technology", "Quality Assurance", "Expert Team"],
      backgroundImage: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      buttonText: "Get Started"
    },
    {
      id: 3,
      title: "INDUSTRIAL EXCELLENCE & INNOVATION",
      mainText: ["State-of-the-art Equipment", "Rapid Prototyping", "Bulk Production"],
      backgroundImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      buttonText: "Learn More"
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const goToPreviousSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const steps = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      title: "Upload Your Film",
      description: "You can upload your dwg, dxf, jpg, tiff and stl files here."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Get a Quote in 24 Hours",
      description: "As low as Rs. 450/Kg*. We send OUR material for you."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "Confirm Your Order",
      description: "Your order delivery remains in your account."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      title: "Dispatched In 48 Hours",
      description: "Guaranteed delivery at your door step."
    }
  ];

  const stats = [
    { number: "150+", label: "Employees", icon: "👥" },
    { number: "25+", label: "Laser Machines", icon: "⚡" },
    { number: "120+", label: "Press Brakes", icon: "🏭" },
    { number: "50+", label: "Ton Processing Capacity", icon: "⚖️" }
  ];

  const testimonials = [
    {
      name: "Daniel Porter",
      rating: 5,
      text: "Excellent service! The quality of laser cutting is outstanding and delivery was faster than expected. Highly recommended for precision work."
    },
    {
      name: "Ebony Gelhart",
      rating: 5,
      text: "Professional team with great attention to detail. They handled our complex project with ease and delivered exactly what we needed."
    }
  ];

  const features = [
    {
      title: "Save Time, Get Instant Estimates",
      description: "Upload your files and receive accurate quotes within 2 hours, eliminating the need for lengthy back-and-forth communications."
    },
    {
      title: "Skip the Hassle of Material Management",
      description: "We provide all materials needed for your project, so you don't have to worry about sourcing or managing inventory."
    },
    {
      title: "Consolidate Your Vendors",
      description: "One-stop solution for all your laser cutting and bending needs, reducing complexity and improving efficiency."
    },
    {
      title: "Unmatched Capacity and Precision",
      description: "With 25+ laser machines and 120+ press brakes, we can handle projects of any scale with precision and speed."
    },
    {
      title: "247Cutbend",
      description: "24/7 online platform ensuring you can place orders and track progress anytime, anywhere."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Sliding Carousel */}
      <div className="relative h-screen overflow-hidden">
        {/* Slides Container */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('${slide.backgroundImage}')`,
                  filter: 'blur(2px)'
                }}
              />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              
              {/* Content */}
              <div className="relative z-10 h-full flex items-center justify-center text-white px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto">
                  <p className="text-lg sm:text-xl mb-4 font-medium">
                    {slide.title}
                  </p>
                  
                  <div className="space-y-2 mb-8">
                    {slide.mainText.map((text, textIndex) => (
                      <h1 key={textIndex} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                        {text}
                      </h1>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleUploadFiles}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-300 flex items-center space-x-2 mx-auto"
                  >
                    <span>{slide.buttonText}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPreviousSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-300 z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-300 z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-yellow-500 w-8' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Easy Steps Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Easy Steps For <span className="text-yellow-500">Upload</span> <span className="text-yellow-500">Designs</span>
            </h2>
            <div className="w-16 h-1 bg-yellow-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-8 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-yellow-300">
                <div className="bg-yellow-500 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  {step.icon}
                </div>
                <div className="text-2xl font-bold text-gray-400 mb-2">0{index + 1}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button
              onClick={handleUploadFiles}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <span>Upload Design</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Company Statistics Section */}
      <div className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our <span className="text-yellow-500">Achievements</span></h2>
            <p className="text-blue-200 text-lg">Numbers that speak for our excellence</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-32 h-32 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-yellow-400 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl">{stat.icon}</span>
                </div>
                <div className="text-5xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors duration-300">{stat.number}</div>
                <div className="text-blue-200 text-lg font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 relative">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold text-white mb-6">
                What Our Client <span className="text-yellow-500">Say's</span> About Us
              </h2>
              <p className="text-blue-200 text-lg mb-8 leading-relaxed">
                We take pride in delivering exceptional service and quality work. Here's what our satisfied customers have to say about their experience with us.
              </p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center transform hover:scale-105 shadow-lg hover:shadow-xl">
                Know More
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mr-6 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{testimonial.name}</h4>
                      <div className="text-sm text-gray-500 mb-2">Customer</div>
                      <div className="flex text-yellow-500">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed italic">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-yellow-500">247Cutbend</span>?
            </h2>
            <p className="text-2xl text-gray-600 mb-4">1200+ Ton per Month of Laser cutting capacity</p>
            <div className="w-20 h-1 bg-yellow-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-6 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="group-hover:translate-x-2 transition-transform duration-300">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative group">
              <div 
                className="w-full h-[500px] bg-cover bg-center rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
                }}
              />
              <div className="absolute bottom-6 left-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-6 rounded-xl shadow-xl">
                <div className="text-3xl font-bold mb-2">30+</div>
                <div className="text-lg font-semibold">Years Of Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              We Are The <span className="text-yellow-500">Best And Expert</span> For 247CutBend
            </h2>
            <div className="w-20 h-1 bg-yellow-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <p className="text-lg text-gray-600 leading-relaxed">
                247CutBend is your trusted partner for precision cutting, bending, and metal fabrication services. 
                We combine advanced technology with decades of experience to deliver exceptional results for projects 
                of any scale. Our comprehensive range of services includes laser cutting, bending, welding, punching, 
                and design & development.
              </p>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Operating in major cities across India including Bangalore, Delhi NCR, Chennai, and more, 
                we provide top-tier fabrication solutions with unmatched capacity and precision. Our state-of-the-art 
                equipment and expert team ensure your projects are completed with speed, quality, and reliability.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">15+</div>
                  <div className="text-gray-600">Laser Machines</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">9+</div>
                  <div className="text-gray-600">Press Brakes</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="h-64 bg-cover bg-center rounded-2xl shadow-xl"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
                  }}
                />
                <div 
                  className="h-64 bg-cover bg-center rounded-2xl shadow-xl"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1565814636199-ae8133055c1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-6 rounded-2xl shadow-2xl">
                <div className="text-4xl font-bold mb-2">30+</div>
                <div className="text-lg font-semibold">Years Of Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Our <span className="text-yellow-500">Services</span></h2>
            <div className="w-20 h-1 bg-yellow-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cutting</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                We provide precise laser cutting services for intricate designs and large-scale projects, 
                ensuring clean, accurate results every time.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Bending</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our advanced bending services deliver exact angles and precise curves for your metal fabrication needs, 
                ensuring perfect fit and finish.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      {/* <a
        href="https://wa.me/919512041116"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors duration-300 z-50"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </a> */}
    </div>
  );
};

export default Home;
