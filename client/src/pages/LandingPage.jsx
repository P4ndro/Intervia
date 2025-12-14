import { Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../authContext';
import LandingNavbar from '../components/LandingNavbar';
import FeatureCard from '../components/FeatureCard';
import TestimonialCard from '../components/TestimonialCard';
import StepCard from '../components/StepCard';

export default function LandingPage() {
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // If company is logged in, redirect to dashboard
  if (!loading && isAuthenticated && user?.role === 'company') {
    return <Navigate to="/company-dashboard" replace />;
  }

  // If candidate is logged in, redirect to home
  if (!loading && isAuthenticated && user?.role === 'candidate') {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Practice Real Job Interviews. Get Hired Faster.
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Leverage our AI-powered platform to simulate real job interviews, tailored to your industry and role preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-center font-medium"
                  aria-label="Get Started"
                >
                  Get Started
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/signup"
                    className="px-8 py-3 bg-white text-black border-2 border-black rounded-md hover:bg-gray-50 transition-colors text-center font-medium"
                    aria-label="Try Demo Interview"
                  >
                    Try Demo Interview
                  </Link>
                )}
              </div>
            </div>
            <div className="animate-fade-in-delay">
              <div className="rounded-lg aspect-video overflow-hidden shadow-lg">
                <img
                  src="/interview.png"
                  alt="Interview practice platform"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              icon="🎯"
              title="Choose"
              description="Select your desired interview type and role to get started."
            />
            <StepCard
              number="2"
              icon="💬"
              title="Practice"
              description="Engage in realistic interview simulations with AI feedback."
            />
            <StepCard
              number="3"
              icon="📈"
              title="Improve"
              description="Receive detailed analysis and tips to enhance your skills."
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎤"
              title="Realistic Interviews"
              description="Experience interviews that feel just like the real thing, with AI-powered questions tailored to your industry."
            />
            <FeatureCard
              icon="🏢"
              title="Company-Specific Questions"
              description="Practice with questions from top companies in your field to prepare for your dream job."
            />
            <FeatureCard
              icon="📊"
              title="Progress Tracking"
              description="Monitor your improvement over time with detailed analytics and performance metrics."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg p-8 shadow-sm border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">$0</p>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  3 practice interviews
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Basic feedback
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center px-6 py-3 border-2 border-black text-black rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-black transform scale-105">
              <div className="bg-black text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">$29<span className="text-lg text-gray-600">/month</span></p>
              <p className="text-gray-600 mb-6">For serious job seekers</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited interviews
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Detailed AI analysis
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Company-specific questions
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Progress tracking
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">Custom</p>
              <p className="text-gray-600 mb-6">For teams and organizations</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Everything in Pro
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Team management
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Custom integrations
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Dedicated support
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center px-6 py-3 border-2 border-black text-black rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Testimonials
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              image={null}
              quote="Intervia helped me land my dream job at Google. The realistic practice sessions were invaluable."
              name="Sarah Johnson"
              role="Software Engineer"
              company="Google"
            />
            <TestimonialCard
              image={null}
              quote="The AI feedback is incredibly detailed. I improved my interview skills significantly in just a few weeks."
              name="Michael Chen"
              role="Product Manager"
              company="Microsoft"
            />
            <TestimonialCard
              image={null}
              quote="Best investment I made in my career. The company-specific questions really prepared me for my interviews."
              name="Emily Rodriguez"
              role="Data Scientist"
              company="Amazon"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Have questions? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@interviewai.com"
              className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
              aria-label="Email us"
            >
              Email Us
            </a>
            <Link
              to="/signup"
              className="px-8 py-3 bg-white text-black border-2 border-black rounded-md hover:bg-gray-50 transition-colors font-medium"
              aria-label="Get Started"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2023 Intervia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
