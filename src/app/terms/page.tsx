import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-gray-400 mb-8">Last Updated: June 10, 2024</p>
          
          <div className="prose prose-invert max-w-none">
            <p className="mb-6">
              Welcome to Fapend. These Terms of Service ("Terms") govern your use of our mobile application, website, 
              and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound 
              by these Terms. If you do not agree to these Terms, please do not use our Services.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6">
              By accessing or using our Services, you confirm that you accept these Terms and agree to comply with them. 
              If you are using our Services on behalf of a company or other legal entity, you represent that you have 
              the authority to bind such entity to these Terms.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Eligibility</h2>
            <p className="mb-6">
              You must be at least 18 years of age to use our Services. By using our Services, you represent and warrant 
              that you meet this eligibility requirement. If you do not meet this requirement, you must not access or use 
              our Services.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Account Registration</h2>
            <p className="mb-6">
              To access certain features of our Services, you may need to create an account. When registering for an account, 
              you agree to provide accurate, current, and complete information. You are responsible for maintaining the 
              confidentiality of your account credentials and for all activities that occur under your account. You agree 
              to notify us immediately of any unauthorized use of your account.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">4. User Content</h2>
            <p className="mb-4">
              Our Services may allow you to post, upload, or submit content ("User Content"). You retain ownership rights 
              in your User Content, but you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, 
              modify, adapt, publish, translate, distribute, and display such User Content in connection with providing 
              and promoting our Services.
            </p>
            <p className="mb-6">
              You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>You own or have the necessary rights to your User Content</li>
              <li>Your User Content does not violate the rights of any third party</li>
              <li>Your User Content complies with these Terms and applicable laws</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Prohibited Conduct</h2>
            <p className="mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Use our Services in any way that violates any applicable law or regulation</li>
              <li>Impersonate any person or entity or falsely state your affiliation with a person or entity</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use of our Services</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Use our Services to transmit harmful code or malware</li>
              <li>Collect or harvest any personally identifiable information from our Services</li>
              <li>Use our Services for any commercial purpose without our prior written consent</li>
              <li>Engage in harassment, hate speech, or abusive behavior toward other users</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Intellectual Property Rights</h2>
            <p className="mb-6">
              Our Services and their contents, features, and functionality are owned by Fapend and are protected by 
              copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, 
              create derivative works of, publicly display, publicly perform, republish, download, store, or transmit 
              any of the material on our Services without our prior written consent.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">7. Subscription and Payments</h2>
            <p className="mb-4">
              Some features of our Services may require a subscription. By subscribing to our premium services, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Pay all fees associated with your subscription</li>
              <li>Provide accurate billing information</li>
              <li>Promptly update your billing information if it changes</li>
            </ul>
            <p className="mb-6">
              Subscriptions will automatically renew unless canceled at least 24 hours before the end of the current period. 
              You can manage and cancel your subscription through your app store account settings.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Refund Policy</h2>
            <p className="mb-6">
              We offer a 30-day money-back guarantee for our premium subscriptions. If you are not satisfied with our Services, 
              you may request a refund within 30 days of your initial purchase by contacting our support team. Refunds are 
              processed at our discretion and may be affected by the policies of your payment provider or app store.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">9. Disclaimer of Warranties</h2>
            <p className="mb-6">
              OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
              TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="mb-6">
              We do not guarantee that our Services will be uninterrupted, secure, or error-free, or that any defects will be corrected.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">10. Limitation of Liability</h2>
            <p className="mb-6">
              TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL FAPEND, ITS AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, 
              EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR 
              IN CONNECTION WITH YOUR USE OR INABILITY TO USE OUR SERVICES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">11. Indemnification</h2>
            <p className="mb-6">
              You agree to defend, indemnify, and hold harmless Fapend, its affiliates, and their respective officers, directors, 
              employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, 
              or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your 
              use of the Services.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">12. Termination</h2>
            <p className="mb-6">
              We may terminate or suspend your access to our Services immediately, without prior notice or liability, for any 
              reason whatsoever, including if you breach these Terms. Upon termination, your right to use our Services will 
              immediately cease.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">13. Changes to Terms</h2>
            <p className="mb-6">
              We may revise these Terms from time to time. The most current version will always be posted on our website. 
              By continuing to use our Services after revisions become effective, you agree to be bound by the revised Terms.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">14. Governing Law</h2>
            <p className="mb-6">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard 
              to its conflict of law provisions. Any legal action or proceeding arising out of or relating to these Terms or 
              your use of our Services shall be brought exclusively in the federal or state courts located in the United States, 
              and you consent to the personal jurisdiction of such courts.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">15. Contact Information</h2>
            <p className="mb-6">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mb-8">
              <p>Email: terms@fapend.com</p>
              <p>Or visit our <a href="/contact" className="text-accent hover:underline">Contact Page</a></p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 