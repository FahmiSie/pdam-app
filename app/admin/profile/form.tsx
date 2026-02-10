"use client";
import { useState } from "react";
import { Admin } from "../../types";

type Props = {
  admin: Admin;
};

export default function AdminProfileForm({ admin }: Props) {
  const [isEdit, setIsEdit] = useState(false);
  const [profile, setProfile] = useState({
    name: admin.name,
    username: admin.user.username,
    phone: admin.phone,
  });

  const handleCancel = () => {
    setProfile({
      name: admin.name,
      username: admin.user.username,
      phone: admin.phone,
    });
    setIsEdit(false);
  };

  const handleSave = () => {
    // Logic untuk save data ke backend
    console.log("Saving profile:", profile);
    setIsEdit(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Profil Admin</h2>
        {!isEdit && (
          <button
            onClick={() => setIsEdit(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Nama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap
          </label>
          {isEdit ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Masukkan nama lengkap"
            />
          ) : (
            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
              {profile.name}
            </p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          {isEdit ? (
            <input
              type="text"
              value={profile.username}
              onChange={(e) =>
                setProfile({ ...profile, username: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Masukkan username"
            />
          ) : (
            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
              {profile.username}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor Telepon
          </label>
          {isEdit ? (
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Masukkan nomor telepon"
            />
          ) : (
            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
              {profile.phone}
            </p>
          )}
        </div>
      </div>

      {/* Buttons untuk mode Edit */}
      {isEdit && (
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Simpan
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
   