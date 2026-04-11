// Admin Bills Page - Show all bills by admin

import { cookies } from "next/headers";
import AddBill from "./add";
import EditBillPage from "./edit";
import DeleteBillPage from "./delete";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, DollarSign, Activity } from "lucide-react";
import Search from "@/components/Search";
import SimplePagination from "@/components/Pagination";

interface Service {
  id: number;
  name: string;
  min_usage: number;
  max_usage: number;
  price: number;
}

interface Customer {
  id: number;
  name: string;
  customer_number: string;
}

interface Bill {
  id: number;
  customer_id: number;
  admin_id: number;
  service_id: number;
  month: number;
  year: number;
  usage_value: number;
  price: number;
  measurement_number: string;
  paid: boolean;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
  service: Service;
  customer: Customer;
  admin: { id: number; name: string; };
}

type ResultData = {
  success: boolean;
  message: string;
  data: Bill[];
  count: number;
};

type Props = {
  searchParams: Promise<{
    page?: number;
    quantity?: number;
    search?: string;
  }>;
};

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

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
    console.error("Fetch bills error:", error);
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
  const page = Number((await searchParams)?.page) || 1;
  const quantity = Number((await searchParams)?.quantity) || 10;
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
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Tagihan</h1>
            <p className="text-gray-500 mt-1">Kelola tagihan air PDAM pelanggan</p>
          </div>
          <AddBill />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Tagihan</CardTitle>
            <Package className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{count}</div>
            <p className="text-xs text-blue-100 mt-1">Semua tagihan</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Sudah Dibayar</CardTitle>
            <DollarSign className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paidBills}</div>
            <p className="text-xs text-green-100 mt-1">Tagihan lunas</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Belum Dibayar</CardTitle>
            <TrendingUp className="h-5 w-5 text-red-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{unpaidBills}</div>
            <p className="text-xs text-red-100 mt-1">Perlu tindakan</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Pemakaian</CardTitle>
            <Activity className="h-5 w-5 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(totalUsage)}</div>
            <p className="text-xs text-purple-100 mt-1">m³ halaman ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Daftar Tagihan</CardTitle>
              <CardDescription>
                Semua tagihan air PDAM
                {search && (
                  <span className="ml-2 text-blue-600 font-medium">
                    — hasil pencarian &quot;{search}&quot; ({count} ditemukan)
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <Search
                search={search}
                placeholder="Cari tagihan..."
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
                {search ? `Tagihan "${search}" tidak ditemukan` : "Belum ada tagihan"}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {search ? "Coba kata kunci lain." : "Mulai dengan membuat tagihan baru."}
              </p>
              {!search && <div className="mt-6"><AddBill /></div>}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>No</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead className="text-center">Bulan</TableHead>
                    <TableHead className="text-center">Tahun</TableHead>
                    <TableHead>No. Meteran</TableHead>
                    <TableHead className="text-center">Pemakaian</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill, index) => (
                    <TableRow key={bill.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {(page - 1) * quantity + index + 1}
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {bill.customer?.name ?? `ID: ${bill.customer_id}`}
                        </div>
                        {bill.customer?.customer_number && (
                          <div className="text-xs text-gray-400 font-mono">
                            {bill.customer.customer_number}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        {MONTH_NAMES[bill.month] ?? bill.month}
                      </TableCell>

                      <TableCell className="text-center">{bill.year}</TableCell>

                      <TableCell className="font-mono text-sm">{bill.measurement_number}</TableCell>

                      <TableCell className="text-center">{formatNumber(bill.usage_value)} m³</TableCell>

                      <TableCell>
                        <div className="text-sm font-medium">{bill.service?.name ?? "-"}</div>
                        {bill.service && (
                          <div className="text-xs text-gray-400">
                            {bill.service.min_usage}-{bill.service.max_usage} m³
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(bill.price)}
                      </TableCell>

                      <TableCell className="text-center">
                        {bill.paid ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300">Lunas</Badge>
                        ) : (
                          <Badge variant="secondary">Belum Bayar</Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <EditBillPage bill={bill} />
                          <DeleteBillPage billId={bill.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary & Pagination */}
      {count > 0 && (
        <>
          <div className="mt-6 bg-white rounded-xl border shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Tagihan</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Harga (halaman ini)</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalRevenue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Pemakaian (halaman ini)</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{formatNumber(totalUsage)} m³</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <SimplePagination count={count} perPage={quantity} currentPage={page} />
          </div>
        </>
      )}
    </div>
  );
}