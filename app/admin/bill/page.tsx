// button add bill
// show all bills by admin

import { cookies } from "next/headers";
import type { Bills } from "@/types/bills";
import AddBill from "./add";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, DollarSign, Activity } from "lucide-react";
import Search from "@/components/Search";
import SimplePagination from "@/components/Pagination";

import EditBillPage from "./edit";
import DeleteBillPage from "./delete";
import EditBill from "./edit";
type ResultData = {
  success: boolean;
  message: string;
  data: Bills[];
  count: number;
};

type Props = {
  searchParams: Promise<{
    page?: number;
    quantity?: number;
    search?: string;
  }>;
};

async function getBills(
  page: number,
  quantity: number,
  search: string,
): Promise<ResultData> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/bills?page=${page}&quantity=${quantity}&search=${search}`,
      {
        headers: {
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      },
    );

    const result: ResultData = await response.json();
    if (!response.ok)
      return { success: false, message: "Failed", data: [], count: 0 };
    return result;
  } catch (error) {
    console.error("Fetch services error:", error);
    return { success: false, message: "Error", data: [], count: 0 };
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

export default async function BillsPage({ searchParams }: Props) {
  const page = (await searchParams)?.page || 1;
  const quantity = (await searchParams)?.quantity || 10;
  const search = (await searchParams)?.search || "";

  const { data: bills, count } = await getBills(page, quantity, search);

  const totalRevenue = bills.reduce((s, b) => s + b.price, 0);

  const paidBills = bills.filter((b) => b.paid).length;

  const unpaidBills = bills.filter((b) => !b.paid).length;

  const totalUsage = bills.reduce((s, b) => s + b.usage_value, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bills Management
            </h1>
            <p className="text-gray-500 mt-1">Manage your PDAM bills</p>
          </div>
          <AddBill />
        </div>
      </div>

      {/* Stats Cards — ✅ Total Services pakai count */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total Bills
            </CardTitle>
            <Package className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            {/* ✅ count = total semua halaman */}
            <div className="text-3xl font-bold">{count}</div>
            <p className="text-xs text-blue-100 mt-1">Bills packages</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-green-100 mt-1">Per bill</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Total Capacity
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(totalUsage)}</div>
            <p className="text-xs text-purple-100 mt-1">m³ max usage</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">
              Active Services
            </CardTitle>
            <Activity className="h-5 w-5 text-orange-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paidBills}</div>
            <p className="text-xs text-orange-100 mt-1">Available now</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Bills Packages</CardTitle>
              <CardDescription>
                Complete list of all water bills packages
                {search && (
                  <span className="ml-2 text-blue-600 font-medium">
                    — showing results for &quot;{search}&quot; ({count} found)
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <Search
                search={search}
                placeholder="Search bills..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white hover:border-gray-300 shadow-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {search ? `No bills found for "${search}"` : "No bills found"}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "Try a different search term or clear the search."
                  : "Get started by creating a new service package."}
              </p>
              {!search && (
                <div className="mt-6">
                  <AddBill />
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>No</TableHead>
                    <TableHead>Customer Id</TableHead>
                    <TableHead className="text-center">Month</TableHead>
                    <TableHead className="text-center">Year</TableHead>
                    <TableHead>Measurement</TableHead>
                    <TableHead className="text-center">Usage</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill, index) => (
                    <TableRow key={bill.id}>
                      <TableCell>
                        {(Number(page) - 1) * Number(quantity) + index + 1}
                      </TableCell>

                      <TableCell>{bill.customer_id}</TableCell>

                      <TableCell>{bill.month}</TableCell>

                      <TableCell>{bill.year}</TableCell>

                      <TableCell>{bill.measurement_number}</TableCell>

                      <TableCell>{formatNumber(bill.usage_value)} m³</TableCell>

                      <TableCell className="text-green-600 font-semibold">
                        {formatCurrency(bill.price)}
                      </TableCell>

                      <TableCell>
                        {bill.paid ? (
                          <Badge className="bg-green-100 text-green-700">
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Unpaid</Badge>
                        )}
                      </TableCell>

                      <TableCell className="flex justify-center gap-2">
                        <EditBillPage bill={bill} />
                        <DeleteBillPage billId={bill.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Footer */}
      {count > 0 && (
        <>
          <div className="mt-6 bg-linear-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Bills
                  </p>
                  {/* ✅ Pakai count */}
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {count}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Usage
                  </p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {formatNumber(totalUsage)} m³
                  </p>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="mt-6 flex justify-center">
            <SimplePagination
              count={count}
              perPage={quantity}
              currentPage={page}
            />
          </div>
        </>
      )}
    </div>
  );
}
