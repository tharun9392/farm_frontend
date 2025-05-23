import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Link } from 'react-router-dom';

const BlogPage = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Benefits of Organic Rice",
      excerpt: "Discover the health and environmental benefits of choosing organic rice over conventional varieties.",
      imageUrl: "https://via.placeholder.com/600x400",
      date: "June 10, 2023",
      author: "Arjun Reddy"
    },
    {
      id: 2,
      title: "Supporting Local Farmers: Why It Matters",
      excerpt: "Learn how buying from local farmers helps build sustainable communities and strengthens local economies.",
      imageUrl: "https://via.placeholder.com/600x400",
      date: "July 5, 2023",
      author: "Priya Singh"
    },
    {
      id: 3,
      title: "Rice Varieties of Telangana: A Culinary Guide",
      excerpt: "Explore the diverse rice varieties grown in Telangana and their unique culinary applications.",
      imageUrl: "https://via.placeholder.com/600x400",
      date: "August 17, 2023",
      author: "Ravi Kumar"
    },
    {
      id: 4,
      title: "Sustainable Farming Practices in Rice Cultivation",
      excerpt: "An overview of sustainable farming methods being adopted by our partner farmers.",
      imageUrl: "https://via.placeholder.com/600x400",
      date: "September 22, 2023",
      author: "Lakshmi Devi"
    },
    {
      id: 5,
      title: "From Farm to Table: The Journey of Rice",
      excerpt: "Follow the journey of rice from the fields to your dinner table, and learn about our quality control processes.",
      imageUrl: "https://via.placeholder.com/600x400",
      date: "October 30, 2023",
      author: "Suresh Rao"
    },
    {
      id: 6,
      title: "Cooking Perfect Rice: Tips and Tricks",
      excerpt: "Master the art of cooking perfect rice with these simple tips and techniques from culinary experts.",
      imageUrl: "https://via.placeholder.com/600x400",
      date: "November 15, 2023",
      author: "Anjali Sharma"
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">Blog</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-custom overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-primary-600 mb-2">{post.title}</h2>
                <div className="text-sm text-gray-500 mb-3">
                  {post.date} • {post.author}
                </div>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <Link 
                  to={`/blog/${post.id}`} 
                  className="text-primary-600 font-medium hover:text-primary-700"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default BlogPage; 