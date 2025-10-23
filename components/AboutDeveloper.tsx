// About Developer page component
"use client";
import React from 'react';
import Image from 'next/image';

export const AboutDeveloper: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">About the Developer</h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Meet the researcher and educator behind the Integrated Mining Engineering Suite
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Developer Image */}
          <div className="md:w-1/3">
            <div className="relative h-80 md:h-full">
              <Image
                src="/images/developer.jpeg"
                alt="Mritunjay Kumar - Mining Engineering Researcher"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Developer Information */}
          <div className="md:w-2/3 p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Mritunjay Kumar</h2>
            <p className="text-lg text-slate-600 mb-6">
              Researcher, Educator, and Mining Technology Enthusiast
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-teal-700 mb-3">Academic Background</h3>
                <div className="space-y-2 text-slate-700">
                  <p><strong>Current:</strong> Doctor of Philosophy (PhD) in Rock Mechanics at National Institute of Technology Karnataka</p>
                  <p><strong>Previous:</strong> B.Tech in Mining and Mineral Engineering from BIT Sindri</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-teal-700 mb-3">Teaching Experience</h3>
                <div className="space-y-2 text-slate-700">
                  <p><strong>Assistant Professor</strong> at RKDF University Ranchi</p>
                  <p><strong>Assistant Professor & Lecturer</strong> at Jharkhand Rai University</p>
                  <p>Multiple academic roles in mining engineering education</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-teal-700 mb-3">Research Focus</h3>
                <div className="space-y-2 text-slate-700">
                  <p>• Rock mechanics and numerical modelling</p>
                  <p>• Slope stability in marble mines</p>
                  <p>• Production enhancement through real-time dragline planning</p>
                  <p>• Sustainable mining practices</p>
                  <p>• Mining informatics and data analysis</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-teal-700 mb-3">Technical Expertise</h3>
                <div className="space-y-2 text-slate-700">
                  <p>• Rocscience Software specialist</p>
                  <p>• Data analysis and mining informatics</p>
                  <p>• Numerical modelling techniques</p>
                  <p>• Rock mechanics applications</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-teal-700 mb-3">Professional Affiliations</h3>
                <div className="space-y-2 text-slate-700">
                  <p><strong>Student Member</strong> of the International Society for Rock Mechanics and Rock Engineering (ISRM)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Publications */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Research Contributions</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-teal-500 pl-4">
            <h4 className="font-semibold text-slate-800">Published Research</h4>
            <p className="text-slate-600">Peer-reviewed journal publications focusing on critical mining engineering topics</p>
          </div>
          <div className="border-l-4 border-teal-500 pl-4">
            <h4 className="font-semibold text-slate-800">Slope Stability Research</h4>
            <p className="text-slate-600">Specialized research in marble mine slope stability analysis</p>
          </div>
          <div className="border-l-4 border-teal-500 pl-4">
            <h4 className="font-semibold text-slate-800">Production Optimization</h4>
            <p className="text-slate-600">Real-time dragline planning for enhanced mining productivity</p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="bg-linear-to-r from-teal-50 to-blue-50 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-4">Mission</h3>
        <p className="text-lg text-slate-700 leading-relaxed">
          Mritunjay is passionate about advancing the mining field through innovation and data-driven insights. 
          His work combines rigorous academic research with practical engineering applications, creating tools 
          that bridge the gap between theoretical knowledge and real-world mining challenges. This Integrated 
          Mining Engineering Suite represents his commitment to making advanced mining engineering tools 
          accessible to professionals worldwide.
        </p>
      </div>

      {/* Contact Information */}
      {/* <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-4">Connect</h3>
        <p className="text-slate-600 mb-4">
          Interested in collaborating or learning more about mining engineering research?
        </p>
        <div className="flex justify-center space-x-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <p className="text-sm text-slate-600">Academic Research</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm text-slate-600">Mining Engineering</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm text-slate-600">Innovation</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};
