import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last Updated: June 10, 2024</p>
          
          <div className="prose prose-invert max-w-none">
            <p className="mb-6">
              At PureResist, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our mobile application and website.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Personal Data</h3>
            <p className="mb-4">
              When you use our app, we may collect the following types of personal information:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Account information (email address, username, password)</li>
              <li>Profile information (name, age, gender, profile picture)</li>
              <li>Progress tracking data (streaks, achievements, goals)</li>
              <li>Journal entries and personal notes</li>
              <li>User-generated content in community forums</li>
              <li>Communications with our support team</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Usage Data</h3>
            <p className="mb-4">
              We automatically collect certain information when you use our app:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Device information (model, operating system, unique device identifiers)</li>
              <li>Log data (IP address, browser type, pages visited, time spent)</li>
              <li>App usage statistics and interaction data</li>
              <li>Error reports and performance data</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
            <p className="mb-4">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>To provide and maintain our services</li>
              <li>To personalize your experience</li>
              <li>To track your progress and achievements</li>
              <li>To improve our app and develop new features</li>
              <li>To communicate with you about updates and support</li>
              <li>To ensure the security of our platform</li>
              <li>To comply with legal obligations</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Data Security</h2>
            <p className="mb-6">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized 
              access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>End-to-end encryption for sensitive data</li>
              <li>Secure data storage with regular backups</li>
              <li>Access controls and authentication requirements</li>
              <li>Regular security audits and vulnerability testing</li>
              <li>Employee training on data protection practices</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Data Sharing and Disclosure</h2>
            <p className="mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>With service providers who help us operate our app</li>
              <li>To comply with legal requirements and law enforcement requests</li>
              <li>To protect our rights, privacy, safety, and property</li>
              <li>In connection with a business transaction (e.g., merger or acquisition)</li>
              <li>With your consent or at your direction</li>
            </ul>
            <p className="mb-6">
              We do not sell your personal information to third parties.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Your Privacy Rights</h2>
            <p className="mb-4">
              Depending on your location, you may have the following rights regarding your data:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Right to access and receive a copy of your data</li>
              <li>Right to rectify or update your personal information</li>
              <li>Right to delete your personal data</li>
              <li>Right to restrict or object to our processing of your data</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent (where processing is based on consent)</li>
            </ul>
            <p className="mb-6">
              To exercise these rights, please contact us at privacy@PureResist.com.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Children's Privacy</h2>
            <p className="mb-6">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children. If we learn that we have collected personal information from a child under 18, 
              we will take steps to delete such information as soon as possible.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Privacy Policy</h2>
            <p className="mb-6">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last Updated" date. We recommend that you review this Privacy 
              Policy periodically for any changes.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p className="mb-6">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mb-8">
              <p>Email: privacy@PureResist.com</p>
              <p>Or visit our <a href="/contact" className="text-accent hover:underline">Contact Page</a></p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 