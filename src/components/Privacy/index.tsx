import React from 'react';

import Layout from '@/containers/Layout';

const Privacy = () => {
  return (
    <Layout>
      <div className="card max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-600 mb-8">Last Updated: October 26, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to PointPal.app ("we," "our," or "us"). We respect your privacy and are committed to protecting
              your personal data. This privacy policy will inform you about how we handle your personal data when you
              visit our website and use our services, and tell you about your privacy rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may collect, use, store, and transfer different kinds of personal data about you:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Identity Data:</strong> includes name, username, or similar identifier</li>
              <li><strong>Contact Data:</strong> includes email address</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website and services</li>
              <li><strong>Planning Poker Data:</strong> includes poker table data, voting history, and team collaboration information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use Firebase and other secure third-party services to store your data. While we strive to use
              commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
              We implement appropriate technical and organizational measures to protect your data against unauthorized
              or unlawful processing and against accidental loss, destruction, or damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your personal data in the following situations:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>With Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf, such as hosting and authentication services</li>
              <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities</li>
              <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service may contain links to third-party websites or integrate with third-party services (such as
              Jira) that are not operated by us. We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Firebase:</strong> For authentication and data storage</li>
              <li><strong>Jira:</strong> For issue tracking integration (when enabled by users)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              We strongly advise you to review the privacy policies of any third-party services you interact with.
              We have no control over and assume no responsibility for the content, privacy policies, or practices
              of any third-party sites or services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We will retain your personal data only for as long as is necessary for the purposes set out in this
              privacy policy. We will retain and use your data to the extent necessary to comply with our legal
              obligations, resolve disputes, and enforce our policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Your Data Protection Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Access:</strong> You have the right to request copies of your personal data</li>
              <li><strong>Rectification:</strong> You have the right to request correction of inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> You have the right to request deletion of your personal data under certain conditions</li>
              <li><strong>Restrict Processing:</strong> You have the right to request restriction of processing your personal data under certain conditions</li>
              <li><strong>Object to Processing:</strong> You have the right to object to our processing of your personal data under certain conditions</li>
              <li><strong>Data Portability:</strong> You have the right to request transfer of your data to another organization or directly to you under certain conditions</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you make a request, we have one month to respond to you. If you would like to exercise any of these
              rights, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity on our Service and hold certain
              information. Cookies are files with a small amount of data which may include an anonymous unique
              identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
              sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service does not address anyone under the age of 13. We do not knowingly collect personally
              identifiable information from anyone under the age of 13. If you are a parent or guardian and you are
              aware that your child has provided us with personal data, please contact us so that we can take
              necessary action.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update our privacy policy from time to time. We will notify you of any changes by posting the
              new privacy policy on this page and updating the "Last Updated" date at the top of this policy. You are
              advised to review this privacy policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us through
              the contact information provided on our website.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
