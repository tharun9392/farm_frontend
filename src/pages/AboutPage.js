import React from 'react';
import { FaLeaf, FaUsers, FaSeedling, FaHandshake } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';

const AboutPage = () => {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">About FarmeRice</h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              We connect farmers directly with consumers to provide quality rice products at fair prices while supporting the farming community.
            </p>
          </div>
          
          {/* Our Story Section */}
          <div className="mb-20">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
                <div className="mt-6 text-lg text-gray-600 space-y-4">
                  <p>
                    Farmer Rice was founded in 2020 with a simple mission: to revolutionize the rice supply chain by removing unnecessary middlemen and connecting rice farmers directly with consumers.
                  </p>
                  <p>
                    Our founder, who grew up in a farming family, witnessed firsthand the challenges faced by rice farmers who often received minimal returns despite their hard work and dedication. This inspired the creation of Farmer Rice as a platform that ensures farmers receive fair compensation while providing consumers with high-quality, traceable rice products.
                  </p>
                  <p>
                    Today, we work with over 200 farmers across India's major rice-growing regions, helping them market their produce to a wider audience while maintaining traditional and sustainable farming practices.
                  </p>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <img 
                  src="/img.png" 
                  alt="Rice fields" 
                  className="rounded-lg shadow-lg object-cover h-96 w-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1500455497814-0b8db1d32380?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80';
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Values Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                  <FaLeaf className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sustainability</h3>
                <p className="text-gray-600">
                  We promote and support sustainable farming practices that protect the environment for future generations.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                  <FaUsers className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600">
                  We build strong relationships with farming communities and help them thrive economically.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                  <FaSeedling className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quality</h3>
                <p className="text-gray-600">
                  We are committed to providing the highest quality rice products with full transparency about their origin.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                  <FaHandshake className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fair Trade</h3>
                <p className="text-gray-600">
                  We ensure farmers receive fair compensation for their produce and labor.
                </p>
              </div>
            </div>
          </div>
          
          {/* Team Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Team</h2>
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <img 
                  src="/assets/images/photos/1st.jpg" 
                  alt="Founder" 
                  className="mx-auto h-40 w-40 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://randomuser.me/api/portraits/men/32.jpg';
                  }}
                />
                <h3 className="mt-4 text-xl font-bold text-gray-900">Badavath Tharun</h3>
                <p className="text-green-600">Founder & CEO</p>
                <p className="mt-2 text-gray-600">
                  From a rice farming family in Telangana, Badavath Tharun has over 10 years of experience in agriculture and business management.
                </p>
              </div>
              <div className="text-center">
                <img 
                  src="/assets/images/photos/2nd.jpg" 
                  alt="Operations Head" 
                  className="mx-auto h-40 w-40 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://randomuser.me/api/portraits/women/44.jpg';
                  }}
                />
                <h3 className="mt-4 text-xl font-bold text-gray-900">Badavath Shiva Shankar</h3>
                <p className="text-green-600">Head of Operations</p>
                <p className="mt-2 text-gray-600">
                  An expert in supply chain management, Badavath Shiva Shankar ensures smooth operations from farm to consumer.
                </p>
              </div>
              <div className="text-center">
                <img 
                  src="/assets/images/photos/3rd.jpg" 
                  alt="Agricultural Expert" 
                  className="mx-auto h-40 w-40 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://randomuser.me/api/portraits/men/68.jpg';
                  }}
                />
                <h3 className="mt-4 text-xl font-bold text-gray-900">Akula Saivivek</h3>
                <p className="text-green-600">Managing Director</p>
                <p className="mt-2 text-gray-600">
                  As Managing Director, Akula Saivivek oversees strategic initiatives and drives innovation in sustainable farming practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage; 