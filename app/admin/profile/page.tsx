import { getCookie } from "@/app/lib/server-cookie";
import AdminProfileForm from "./form";

export const dynamic = 'force-dynamic';

interface Root {
  success: boolean;
  message: string;
  data: Data;
}

interface Data {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
}

async function getAdminProfile(): Promise<Data | null> {
  try {
    const token = await getCookie("accessToken");
    const url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/admins/me`;

    console.log("Fetching admin profile from:", url);
    console.log("Token exists:", !!token);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "APP-KEY": `${process.env.NEXT_PUBLIC_APP_KEY || ""}`,
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData: Root = await response.json();

    console.log("API Response Status:", response.status);
    console.log("API Response:", responseData);

    if (!response.ok) {
      console.log("Error:", responseData.message);
      return null;
    }
    return responseData.data;
  } catch (error) {
    console.log("Fetch error:", error);
    return null;
  }
}

export default async function ProfilePage() {
  let adminData = null;

  try {
    adminData = await getAdminProfile();
  } catch (error) {
    console.error("Error fetching admin profile:", error);
  }

  if (!adminData) {
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
            Sorry, admin profile could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Profile</h1>
          <p className="text-slate-600">Manage your account information</p>
        </div>
        <AdminProfileForm admin={adminData} />
      </div>
    </div>
  );
}