import { getCookie } from "@/app/lib/server-cookie";
import { AdminProfileContent } from "./admin-profile-content";

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

export default async function Page() {
  let adminData = null;
  let hasError = false;

  try {
    adminData = await getAdminProfile();
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    hasError = true;
  }

  return <AdminProfileContent adminData={adminData} error={hasError} />;
}