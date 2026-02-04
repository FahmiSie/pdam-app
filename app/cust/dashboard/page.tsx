import { getCookie } from "@/app/lib/server-cookie";
import { CustomerDashboardContent } from "./customer-dashboard-content";

export const dynamic = 'force-dynamic';

interface CustomerResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    user_id: number;
    customer_number: string;
    name: string;
    phone: string;
    address: string;
    service_id: number;
    owner_token: string;
    createdAt: string;
    updatedAt: string;
  };
}

async function getCustomerProfile(): Promise<CustomerResponse['data'] | null> {
  try {
    const token = await getCookie("accessToken");
    const url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/me`;

    console.log("Fetching customer profile from:", url);
    console.log("Token exists:", !!token);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "APP-KEY": `${process.env.NEXT_PUBLIC_APP_KEY || ""}`,
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData: CustomerResponse = await response.json();

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
  let customerData = null;
  let hasError = false;

  try {
    customerData = await getCustomerProfile();
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    hasError = true;
  }

  return <CustomerDashboardContent customerData={customerData} error={hasError} />;
}