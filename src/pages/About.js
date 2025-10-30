import React from 'react';
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  TrophyIcon,
  ShieldCheckIcon,
  HeartIcon,
  LightBulbIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const companyStats = [
    { label: 'Years of Experience', value: '15+', icon: ClockIcon },
    { label: 'Projects Completed', value: '5000+', icon: ChartBarIcon },
    { label: 'Team Members', value: '50+', icon: UserGroupIcon },
    { label: 'Countries Served', value: '25+', icon: GlobeAltIcon },
    { label: 'Customer Satisfaction', value: '99%', icon: StarIcon },
    { label: 'Quality Rate', value: '99.8%', icon: ShieldCheckIcon }
  ];

  const coreValues = [
    {
      title: 'Excellence',
      description: 'We strive for perfection in every project, maintaining the highest standards of quality and craftsmanship.',
      icon: StarIcon,
      color: 'text-yellow-600'
    },
    {
      title: 'Innovation',
      description: 'Continuously exploring new technologies and methods to improve our manufacturing processes.',
      icon: LightBulbIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Integrity',
      description: 'Building trust through honest communication, transparent pricing, and reliable delivery.',
      icon: ShieldCheckIcon,
      color: 'text-green-600'
    },
    {
      title: 'Customer Focus',
      description: 'Putting our customers first, understanding their needs, and exceeding their expectations.',
      icon: HeartIcon,
      color: 'text-red-600'
    }
  ];

  const milestones = [
    {
      year: '2008',
      title: 'Company Founded',
      description: 'Komacut was established with a vision to revolutionize sheet metal manufacturing through technology and innovation.'
    },
    {
      year: '2012',
      title: 'First Major Contract',
      description: 'Secured our first major automotive industry contract, marking the beginning of our growth phase.'
    },
    {
      year: '2015',
      title: 'ISO Certification',
      description: 'Achieved ISO 9001:2015 certification, demonstrating our commitment to quality management systems.'
    },
    {
      year: '2018',
      title: 'Technology Upgrade',
      description: 'Invested in state-of-the-art CNC laser cutting machines and advanced manufacturing software.'
    },
    {
      year: '2020',
      title: 'Digital Platform Launch',
      description: 'Launched our online platform, enabling customers to submit inquiries and track orders digitally.'
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description: 'Expanded operations to serve customers in 25+ countries with enhanced manufacturing capabilities.'
    }
  ];

  const certifications = [
    {
      name: 'ISO 9001:2015',
      description: 'Quality Management Systems',
      year: '2015'
    },
    {
      name: 'AS9100D',
      description: 'Aerospace Quality Management',
      year: '2018'
    },
    {
      name: 'IATF 16949',
      description: 'Automotive Quality Management',
      year: '2020'
    },
    {
      name: 'ISO 14001:2015',
      description: 'Environmental Management',
      year: '2021'
    }
  ];

  const teamMembers = [
    {
      name: 'Michael Chen',
      position: 'CEO & Founder',
      experience: '20+ years in manufacturing',
      expertise: 'Strategic leadership, operations management'
    },
    {
      name: 'Sarah Johnson',
      position: 'CTO',
      experience: '15+ years in engineering',
      expertise: 'Technology innovation, process optimization'
    },
    {
      name: 'David Rodriguez',
      position: 'Head of Operations',
      experience: '18+ years in production',
      expertise: 'Manufacturing processes, quality control'
    },
    {
      name: 'Lisa Wang',
      position: 'Head of Customer Success',
      experience: '12+ years in customer relations',
      expertise: 'Customer experience, project management'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-komacut-600 to-komacut-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Komacut
            </h1>
            <p className="text-xl md:text-2xl text-komacut-100 max-w-3xl mx-auto">
              Pioneering the future of sheet metal manufacturing through innovation, quality, and customer excellence since 2008.
            </p>
          </div>
        </div>
      </div>

      {/* Company Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Founded in 2008, Komacut began as a small workshop with a big vision: to transform the sheet metal 
              manufacturing industry through technology and innovation. What started with a single laser cutting 
              machine has grown into a state-of-the-art manufacturing facility serving customers worldwide.
            </p>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Our journey has been driven by a passion for excellence and a commitment to solving complex 
              manufacturing challenges. Today, we're proud to be at the forefront of the industry, combining 
              traditional craftsmanship with cutting-edge technology.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              From automotive giants to aerospace innovators, from medical device manufacturers to architectural 
              visionaries, we've built lasting partnerships based on trust, quality, and reliability.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-2 gap-6">
              {companyStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <stat.icon className="h-8 w-8 text-komacut-600" />
                  </div>
                  <div className="text-2xl font-bold text-komacut-600 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission & Vision</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Driving innovation in sheet metal manufacturing while delivering exceptional value to our customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="bg-komacut-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <BuildingOfficeIcon className="h-10 w-10 text-komacut-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide innovative, high-quality sheet metal manufacturing solutions that empower our 
                customers to bring their designs to life. We strive to be the trusted partner for all 
                manufacturing needs, delivering precision, reliability, and excellence in every project.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-komacut-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <GlobeAltIcon className="h-10 w-10 text-komacut-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the global leader in advanced sheet metal manufacturing, setting industry standards 
                for innovation, sustainability, and customer satisfaction. We envision a future where 
                manufacturing is seamless, efficient, and environmentally responsible.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            The principles that guide everything we do and shape our company culture
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {coreValues.map((value, index) => (
            <div key={index} className="text-center">
              <div className={`bg-komacut-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                <value.icon className={`h-8 w-8 ${value.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Company Timeline */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Key milestones that have shaped our company's growth and success
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-komacut-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-komacut-600 rounded-full border-4 border-white shadow-lg"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                      <div className="text-2xl font-bold text-komacut-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Certifications & Awards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Certifications & Awards</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Recognition of our commitment to quality, safety, and environmental responsibility
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="bg-komacut-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="h-8 w-8 text-komacut-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
              <div className="text-sm font-medium text-komacut-600">{cert.year}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Team */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Meet the experienced professionals driving our company's success and innovation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <div className="bg-komacut-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-komacut-600 font-medium mb-2">{member.position}</p>
                <p className="text-sm text-gray-600 mb-2">{member.experience}</p>
                <p className="text-xs text-gray-500">{member.expertise}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-komacut-600 to-komacut-800 rounded-lg p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Success Story</h2>
          <p className="text-xl text-komacut-100 mb-8 max-w-2xl mx-auto">
            Partner with a company that values quality, innovation, and customer success. 
            Let's build something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-3 bg-white text-komacut-600 font-semibold rounded-md hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </a>
            <a
              href="/services"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-komacut-600 transition-colors"
            >
              Explore Our Services
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
