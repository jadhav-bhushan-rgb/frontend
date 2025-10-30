import React, { useState } from 'react';
import { 
  WrenchScrewdriverIcon,
  CogIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  TruckIcon,
  ShieldCheckIcon,
  BeakerIcon,
  CpuChipIcon,
  PaintBrushIcon,
  CubeIcon,
  RulerIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Services = () => {
  const [activeTab, setActiveTab] = useState('fabrication');

  const mainServices = [
    {
      id: 'fabrication',
      title: 'Sheet Metal Fabrication',
      icon: WrenchScrewdriverIcon,
      description: 'Comprehensive sheet metal manufacturing services with precision and quality',
      features: [
        'Custom part design and development',
        'Prototype and production runs',
        'Complex geometry handling',
        'Tight tolerance manufacturing',
        'Quality assurance testing'
      ]
    },
    {
      id: 'laser-cutting',
      title: 'CNC Laser Cutting',
      icon: CpuChipIcon,
      description: 'High-precision laser cutting for complex shapes and tight tolerances',
      features: [
        'Fiber laser cutting technology',
        'Up to 25mm material thickness',
        '±0.1mm precision tolerance',
        'Complex contour cutting',
        'Nesting optimization'
      ]
    },
    {
      id: 'bending-forming',
      title: 'Bending & Forming',
      icon: CubeIcon,
      description: 'Professional metal bending and forming with advanced equipment',
      features: [
        'CNC press brake operations',
        'Multiple bend angles',
        'Complex forming operations',
        'Springback compensation',
        'Quality inspection'
      ]
    },
    {
      id: 'welding',
      title: 'Welding Services',
      icon: BeakerIcon,
      description: 'Expert welding and assembly for various materials and applications',
      features: [
        'TIG and MIG welding',
        'Spot welding capabilities',
        'Seam welding operations',
        'Quality weld inspection',
        'Post-weld finishing'
      ]
    },
    {
      id: 'prototype',
      title: 'Prototype Development',
      icon: DocumentTextIcon,
      description: 'Rapid prototyping and testing for design validation',
      features: [
        'Quick turnaround times',
        'Design optimization',
        'Material testing',
        'Functional validation',
        'Cost-effective solutions'
      ]
    },
    {
      id: 'production',
      title: 'Production Manufacturing',
      icon: BuildingOfficeIcon,
      description: 'High-volume production with consistent quality and delivery',
      features: [
        'Large-scale production runs',
        'Supply chain management',
        'Quality control systems',
        'On-time delivery',
        'Cost optimization'
      ]
    }
  ];

  const technicalSpecs = {
    materials: [
      { name: 'Steel', grades: ['A36', 'A1011', 'A1008', 'A653'], thickness: '0.5mm - 25mm' },
      { name: 'Stainless Steel', grades: ['304', '316', '430', '201'], thickness: '0.5mm - 20mm' },
      { name: 'Aluminum', grades: ['5052', '6061', '3003', '7075'], thickness: '0.5mm - 15mm' },
      { name: 'Copper', grades: ['C110', 'C102', 'C101'], thickness: '0.5mm - 10mm' },
      { name: 'Brass', grades: ['C260', 'C360', 'C464'], thickness: '0.5mm - 8mm' },
      { name: 'Galvanized Steel', grades: ['G90', 'G60', 'G30'], thickness: '0.5mm - 20mm' }
    ],
    capabilities: {
      maxSize: '4000mm x 2000mm',
      tolerance: '±0.1mm standard, ±0.05mm precision',
      thickness: '0.5mm - 25mm',
      finish: ['Powder Coating', 'Anodizing', 'Plating', 'Brushing', 'Polishing', 'Passivation']
    }
  };

  const industries = [
    {
      name: 'Automotive Industry',
      services: ['Body panels', 'Chassis components', 'Interior parts', 'Engine components'],
      icon: TruckIcon
    },
    {
      name: 'Aerospace & Defense',
      services: ['Structural components', 'Avionics enclosures', 'Engine parts', 'Landing gear'],
      icon: BuildingOfficeIcon
    },
    {
      name: 'Electronics & Telecommunications',
      services: ['Enclosures', 'Heat sinks', 'Mounting brackets', 'Shielding components'],
      icon: CpuChipIcon
    },
    {
      name: 'Medical Equipment',
      services: ['Surgical instruments', 'Device housings', 'Equipment frames', 'Sterilization trays'],
      icon: ShieldCheckIcon
    },
    {
      name: 'Construction & Architecture',
      services: ['Cladding panels', 'Structural elements', 'Decorative features', 'HVAC components'],
      icon: BuildingOfficeIcon
    },
    {
      name: 'Food & Beverage Processing',
      services: ['Processing equipment', 'Storage containers', 'Conveyor systems', 'Safety guards'],
      icon: BeakerIcon
    }
  ];

  const processFlow = [
    {
      step: 1,
      title: 'Design & Consultation',
      description: 'Review requirements and provide technical consultation',
      icon: DocumentTextIcon
    },
    {
      step: 2,
      title: 'Quotation & Planning',
      description: 'Provide detailed quotes and production planning',
      icon: CurrencyDollarIcon
    },
    {
      step: 3,
      title: 'Material Selection',
      description: 'Choose appropriate materials and verify availability',
      icon: CubeIcon
    },
    {
      step: 4,
      title: 'Manufacturing',
      description: 'Execute production with quality control checks',
      icon: CogIcon
    },
    {
      step: 5,
      title: 'Quality Inspection',
      description: 'Comprehensive testing and quality verification',
      icon: CheckCircleIcon
    },
    {
      step: 6,
      title: 'Packaging & Delivery',
      description: 'Safe packaging and timely delivery',
      icon: TruckIcon
    }
  ];

  const qualityAssurance = [
    'First Article Inspection (FAI)',
    'In-process quality checks',
    'Final inspection and testing',
    'Dimensional verification',
    'Material certification',
    'Surface finish validation',
    'Welding quality assessment',
    'Documentation and traceability'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-komacut-600 to-komacut-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl md:text-2xl text-komacut-100 max-w-3xl mx-auto">
              Comprehensive sheet metal manufacturing solutions with cutting-edge technology and unmatched expertise
            </p>
          </div>
        </div>
      </div>

      {/* Main Services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Manufacturing Services</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From concept to completion, we provide end-to-end manufacturing solutions for all your sheet metal needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mainServices.map((service) => (
            <div 
              key={service.id}
              className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all duration-300 ${
                activeTab === service.id 
                  ? 'ring-2 ring-komacut-500 shadow-xl transform scale-105' 
                  : 'hover:shadow-xl hover:transform hover:scale-105'
              }`}
              onClick={() => setActiveTab(service.id)}
            >
              <div className="flex items-center mb-4">
                <service.icon className="h-10 w-10 text-komacut-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-komacut-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Service Details</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Detailed information about our manufacturing capabilities and technical specifications
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Materials */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Materials We Work With</h3>
              <div className="space-y-4">
                {technicalSpecs.materials.map((material, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{material.name}</h4>
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Grades:</span> {material.grades.join(', ')}</p>
                      <p><span className="font-medium">Thickness:</span> {material.thickness}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Capabilities</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Maximum Size</h4>
                  <p className="text-gray-600">{technicalSpecs.capabilities.maxSize}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Tolerance</h4>
                  <p className="text-gray-600">{technicalSpecs.capabilities.tolerance}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Material Thickness</h4>
                  <p className="text-gray-600">{technicalSpecs.capabilities.thickness}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Surface Finishes</h4>
                  <p className="text-gray-600">{technicalSpecs.capabilities.finish.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industries We Serve */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Industries We Serve</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our expertise spans across multiple industries, providing tailored solutions for each sector
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industries.map((industry, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <industry.icon className="h-8 w-8 text-komacut-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">{industry.name}</h3>
              </div>
              <ul className="space-y-2">
                {industry.services.map((service, serviceIndex) => (
                  <li key={serviceIndex} className="flex items-center text-sm text-gray-600">
                    <ArrowRightIcon className="h-4 w-4 text-komacut-500 mr-2 flex-shrink-0" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Manufacturing Process */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Manufacturing Process</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A systematic approach to delivering high-quality products on time and within budget
            </p>
          </div>

          <div className="relative">
            {/* Process line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-komacut-200 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
              {processFlow.map((step, index) => (
                <div key={index} className="relative text-center">
                  {/* Step number */}
                  <div className="bg-komacut-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-lg font-bold relative z-10">
                    {step.step}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-center mb-3">
                      <step.icon className="h-6 w-6 text-komacut-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quality Assurance */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quality Assurance</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our commitment to quality is reflected in every step of our manufacturing process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Quality Standards</h3>
            <ul className="space-y-3">
              {qualityAssurance.map((item, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <CheckCircleIcon className="h-5 w-5 text-komacut-500 mr-3 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Certifications</h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <ShieldCheckIcon className="h-8 w-8 text-komacut-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">ISO 9001:2015</h4>
                  <p className="text-sm text-gray-600">Quality Management Systems</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <ShieldCheckIcon className="h-8 w-8 text-komacut-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">AS9100D</h4>
                  <p className="text-sm text-gray-600">Aerospace Quality Management</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <ShieldCheckIcon className="h-8 w-8 text-komacut-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">IATF 16949</h4>
                  <p className="text-sm text-gray-600">Automotive Quality Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-komacut-600 to-komacut-800 rounded-lg p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl text-komacut-100 mb-8 max-w-2xl mx-auto">
            Get a free consultation and quote for your sheet metal manufacturing needs. 
            Our experts are ready to help bring your ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-3 bg-white text-komacut-600 font-semibold rounded-md hover:bg-gray-100 transition-colors"
            >
              Get Free Quote
            </a>
            <a
              href="/about"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-komacut-600 transition-colors"
            >
              Learn More About Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
