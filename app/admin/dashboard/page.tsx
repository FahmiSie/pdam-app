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

interface DashboardStats {
  totalCustomers: number;
  totalServices: number;
  totalBilling: number;
  totalPayments: number;
  recentCustomers: any[];
  pendingBills: any[];
  paymentStatus: { name: string; value: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  billsVsPaid: { month: string; bills: number; paid: number }[];
  topPayingCustomers: { name: string; totalAmount: number; customer_number: string }[];
  unpaidCustomers: { name: string; unpaidBills: number; totalUnpaid: number; customer_number: string }[];
  waterUsagePerCustomer: { name: string; usage: number; customer_number: string }[];
  adminPerformance: { name: string; verifiedCount: number }[];
  recentPayments: any[];
}

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

async function getAdminProfile(): Promise<Data | null> {
  try {
    const token = (await getCookie("adminToken")) || (await getCookie("accessToken"));
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/admins/me`, {
      method: "GET",
      headers: {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const responseData: Root = await response.json();
    if (!response.ok) return null;
    return responseData.data;
  } catch {
    return null;
  }
}

async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const token = (await getCookie("adminToken")) || (await getCookie("accessToken"));
    const headers = {
      "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
      Authorization: `Bearer ${token}`,
    };

    // Fetch all data with quantity=9999 to compute global statistics
    const [customersRes, servicesRes, billsRes, paymentsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers?page=1&quantity=9999`, { headers, cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/services?page=1&quantity=9999`, { headers, cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/bills?page=1&quantity=9999`, { headers, cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/payments?page=1&quantity=9999`, { headers, cache: "no-store" }),
    ]);

    const [customers, services, bills, payments] = await Promise.all([
      customersRes.json(),
      servicesRes.json(),
      billsRes.json(),
      paymentsRes.json(),
    ]);

    const customersData = customers.data || [];
    const servicesData = services.data || [];
    const billsData = bills.data || [];
    const paymentsData = payments.data || [];

    // 1. Payment Status
    const verifiedPayments = paymentsData.filter((p: any) => p.verified);
    const pendingPayments = paymentsData.filter((p: any) => !p.verified);
    
    // Unpaid bills are those that don't have ANY payment associated, or the payment is not verified (but let's define unpaid as "no payment yet" as per requirement)
    // "unpaid (no payment yet)"
    const unpaidBills = billsData.filter((b: any) => !paymentsData.some((p: any) => p.bill_id === b.id));

    const paymentStatus = [
      { name: "Verified", value: verifiedPayments.length },
      { name: "Pending", value: pendingPayments.length },
      { name: "Unpaid", value: unpaidBills.length },
    ];

    // 2. Total Revenue (Monthly Trend)
    const revenueMap: Record<number, number> = {};
    verifiedPayments.forEach((p: any) => {
      if (p.bill?.month) {
        revenueMap[p.bill.month] = (revenueMap[p.bill.month] || 0) + (p.total_amount || 0);
      }
    });
    const monthlyRevenue = Object.entries(revenueMap).map(([m, rev]) => ({
      month: MONTH_NAMES[parseInt(m)] || `Bulan ${m}`,
      revenue: rev
    }));

    // 3. Bills vs Paid
    const billsMap: Record<number, { bills: number, paid: number }> = {};
    billsData.forEach((b: any) => {
      if (!billsMap[b.month]) billsMap[b.month] = { bills: 0, paid: 0 };
      billsMap[b.month].bills += (b.price || 0);
    });
    verifiedPayments.forEach((p: any) => {
      if (p.bill?.month) {
        if (!billsMap[p.bill.month]) billsMap[p.bill.month] = { bills: 0, paid: 0 };
        billsMap[p.bill.month].paid += (p.total_amount || 0);
      }
    });
    const billsVsPaid = Object.entries(billsMap).map(([m, data]) => ({
      month: MONTH_NAMES[parseInt(m)] || `Bulan ${m}`,
      bills: data.bills,
      paid: data.paid
    }));

    // 4. Customer Insights
    const customerPayments: Record<number, { name: string, totalAmount: number, customer_number: string }> = {};
    verifiedPayments.forEach((p: any) => {
      if (p.bill?.customer) {
        const cid = p.bill.customer.id;
        if (!customerPayments[cid]) customerPayments[cid] = { name: p.bill.customer.name, totalAmount: 0, customer_number: p.bill.customer.customer_number };
        customerPayments[cid].totalAmount += (p.total_amount || 0);
      }
    });
    const topPayingCustomers = Object.values(customerPayments).sort((a,b) => b.totalAmount - a.totalAmount).slice(0, 5);

    const unpaidCustMap: Record<number, { name: string, unpaidBills: number, totalUnpaid: number, customer_number: string }> = {};
    unpaidBills.forEach((b: any) => {
      if (b.customer) {
        const cid = b.customer.id;
        if (!unpaidCustMap[cid]) unpaidCustMap[cid] = { name: b.customer.name, unpaidBills: 0, totalUnpaid: 0, customer_number: b.customer.customer_number };
        unpaidCustMap[cid].unpaidBills += 1;
        unpaidCustMap[cid].totalUnpaid += (b.price || 0);
      }
    });
    const unpaidCustomers = Object.values(unpaidCustMap).sort((a,b) => b.totalUnpaid - a.totalUnpaid).slice(0, 5);

    // 5. Water Usage per Customer
    const usageMap: Record<number, { name: string, usage: number, customer_number: string }> = {};
    billsData.forEach((b: any) => {
      if (b.customer) {
        const cid = b.customer.id;
        if (!usageMap[cid]) usageMap[cid] = { name: b.customer.name, usage: 0, customer_number: b.customer.customer_number };
        usageMap[cid].usage += (b.usage_value || 0);
      }
    });
    const waterUsagePerCustomer = Object.values(usageMap).sort((a,b) => b.usage - a.usage).slice(0, 10);

    // 6. Admin Performance
    const adminPerf: Record<number, { name: string, verifiedCount: number }> = {};
    verifiedPayments.forEach((p: any) => {
      // In the API, the admin verifying might be payment.bill.admin (which is the admin who created the bill)
      // or we just use whatever admin is available on the bill
      if (p.bill?.admin) {
        const aid = p.bill.admin.id;
        if (!adminPerf[aid]) adminPerf[aid] = { name: p.bill.admin.name, verifiedCount: 0 };
        adminPerf[aid].verifiedCount += 1;
      }
    });
    const adminPerformance = Object.values(adminPerf).sort((a,b) => b.verifiedCount - a.verifiedCount);

    return {
      totalCustomers: customers.count || customersData.length || 0,
      totalServices: services.count || servicesData.length || 0,
      totalBilling: unpaidBills.length, // Tagihan menunggu = unpaid
      totalPayments: verifiedPayments.length,
      recentCustomers: customersData.slice(0, 5),
      pendingBills: unpaidBills.slice(0, 5), // Wait, pending bills are actually unpaid bills
      
      paymentStatus,
      monthlyRevenue,
      billsVsPaid,
      topPayingCustomers,
      unpaidCustomers,
      waterUsagePerCustomer,
      adminPerformance,
      recentPayments: paymentsData.slice(0, 10) // most recent payments
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
  } catch {
    hasError = true;
  }

  return <AdminProfileContent adminData={adminData} dashboardStats={dashboardStats} error={hasError} />;
}