import React from 'react';
import { Link } from 'react-router-dom';

const ComponentManagerLanding = () => {
  const features = [
    {
      title: 'Component Library',
      description: 'Manage your product components and specifications in one place.',
      icon: '📚',
      link: '/component-manager/page'
    },
    {
      title: 'Test Components',
      description: 'Test and validate your components before production.',
      icon: '🧪',
      link: '/test-component-manager'
    },
    {
      title: 'Specifications',
      description: 'Define detailed specifications for each component.',
      icon: '📋',
      link: '/component-manager/page'
    },
    {
      title: 'Quality Control',
      description: 'Ensure quality standards for all components.',
      icon: '✅',
      link: '/component-manager/page'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Component Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your product components, specifications, and quality control processes
            with our comprehensive component management system.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="relative group bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-gray-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Get Started with Component Management
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Start by adding your first component or explore our testing tools
              to ensure quality and consistency across your products.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/component-manager/page"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Manage Components
              </Link>
              <Link
                to="/test-component-manager"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Test Components
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Component Management Features
          </h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy Management
              </h3>
              <p className="text-gray-600">
                Simple interface to add, edit, and organize your components
                with detailed specifications and material information.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quality Control
              </h3>
              <p className="text-gray-600">
                Built-in quality control processes to ensure consistency
                and meet your manufacturing standards.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Production Ready
              </h3>
              <p className="text-gray-600">
                Seamlessly integrate with your production workflow
                and manufacturing processes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentManagerLanding;
