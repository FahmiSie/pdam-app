import { getCookie } from "@/lib/server-cookie";
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

// Interface untuk statistik
interface DashboardStats {
  totalCustomers: number;
  totalServices: number;
  totalBilling: number;
  totalPayments: number;
  recentCustomers: any[];
  pendingBills: any[];
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
      cache: "no-store",
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

async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const token = await getCookie("accessToken");
    
    // Fetch statistics dari API dengan endpoints yang benar
    const [customersRes, servicesRes, billingRes, paymentsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers`, {
        headers: {
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/services`, {
        headers: {
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/billings`, {
        headers: {
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/payments`, {
        headers: {
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }),
    ]);

    // Log response untuk debugging
    console.log("Customers API Status:", customersRes.status);
    console.log("Services API Status:", servicesRes.status);
    console.log("Billings API Status:", billingRes.status);
    console.log("Payments API Status:", paymentsRes.status);

    const customers = await customersRes.json();
    const services = await servicesRes.json();
    const billing = await billingRes.json();
    const payments = await paymentsRes.json();

    console.log("API Responses:", { customers, services, billing, payments });

    return {
      totalCustomers: customers.data?.length || customers.count || 0,
      totalServices: services.data?.length || services.count || 0,
      totalBilling: billing.data?.length || billing.count || 0,
      totalPayments: payments.data?.length || payments.count || 0,
      recentCustomers: customers.data?.slice(0, 5) || [],
      pendingBills: billing.data?.filter((bill: any) => bill.status === 'pending' || !bill.paid).slice(0, 5) || [],
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
}

export default async function Page() {
  let adminData = null;
  let dashboardStats = null;
  let hasError = false;

  try {
    [adminData, dashboardStats] = await Promise.all([
      getAdminProfile(),
      getDashboardStats(),
    ]);
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    hasError = true;
  }

  return <AdminProfileContent adminData={adminData} dashboardStats={dashboardStats} error={hasError} />;
}
