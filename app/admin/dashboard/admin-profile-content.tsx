'use client';
import React from 'react';

interface AdminProfileProps {
  adminData: {
    id: number;
    user_id: number;
    name: string;
    phone: string;
    owner_token: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: number;
      username: string;
      password: string;
      role: string;
      owner_token: string;
      createdAt: string;
      updatedAt: string;
    };
  } | null;
  error: boolean;
}

export function AdminProfileContent({ adminData, error }: AdminProfileProps) {
  if (error || !adminData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-slate-200">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Error</h2>
          <p className="text-slate-600 text-center">
            Sorry, admin does not exist or could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-slate-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-blue-600">
                    {adminData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{adminData.name}</h1>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium">
                      {adminData.user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Account Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Account Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500 block mb-1">Username</label>
                <p className="text-slate-800 font-medium">{adminData.user.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 block mb-1">User ID</label>
                <p className="text-slate-800 font-mono text-sm">{adminData.user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 block mb-1">Admin ID</label>
                <p className="text-slate-800 font-mono text-sm">{adminData.id}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Contact Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500 block mb-1">Phone Number</label>
                <p className="text-slate-800 font-medium">{adminData.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 block mb-1">Full Name</label>
                <p className="text-slate-800 font-medium">{adminData.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Activity Timeline</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <label className="text-sm font-medium text-slate-500 block mb-1">Account Created</label>
              <p className="text-slate-800 font-medium">{formatDate(adminData.createdAt)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <label className="text-sm font-medium text-slate-500 block mb-1">Last Updated</label>
              <p className="text-slate-800 font-medium">{formatDate(adminData.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}