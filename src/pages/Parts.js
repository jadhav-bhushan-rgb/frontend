import React from 'react';
import { Link } from 'react-router-dom';

const Parts = () => {
  const parts = [
    {
      id: 1,
      name: 'Sheet Metal Brackets',
      description: 'Custom fabricated brackets for various applications',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Brackets'
    },
    {
      id: 2,
      name: 'Enclosures',
      description: 'Protective enclosures for electronic components',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Enclosures'
    },
    {
      id: 3,
      name: 'Panels',
      description: 'Control panels and mounting plates',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Panels'
    },
    {
      id: 4,
      name: 'Housings',
      description: 'Protective housings for machinery and equipment',
      image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      category: 'Housings'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sheet Metal Parts
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional sheet metal fabrication services for custom parts and components.
            We specialize in precision manufacturing for various industries.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {parts.map((part) => (
            <div key={part.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                <img 
                  src={part.image} 
                  alt={part.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onLoad={(e) => {
                    e.target.style.opacity = '1';
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  style={{ opacity: '0', transition: 'opacity 0.3s ease' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center" style={{display: 'none'}}>
                  <div className="text-4xl mb-2">
                    {part.category === 'Brackets' && '🔧'}
                    {part.category === 'Enclosures' && '📦'}
                    {part.category === 'Panels' && '⚙️'}
                    {part.category === 'Housings' && '🏠'}
                  </div>
                  <span className="text-gray-700 text-lg font-semibold">{part.name}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{part.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {part.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{part.description}</p>
                <Link 
                  to="/inquiry/new" 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-block text-center"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Need Custom Parts?
            </h2>
            <p className="text-gray-600 mb-6">
              We can manufacture custom sheet metal parts according to your specifications.
              Upload your drawings and get a quote within 24 hours.
            </p>
            <Link 
              to="/inquiry/new" 
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-block"
            >
              Submit Custom Request
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parts;
