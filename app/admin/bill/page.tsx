"use client";

// Admin Bills Page - Show all bills by admin

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
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

interface Payment {
  id: number;
  bill_id: number;
  verified: boolean;
}

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function getToken() { return Cookies.get("adminToken") || Cookies.get("accessToken"); }

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

type FilterStatus = "semua" | "belum_bayar" | "pending" | "lunas";

function getBillStatus(bill: Bill, payments: Payment[]): FilterStatus {
  if (bill.paid) return "lunas";
  const payment = payments.find((p) => p.bill_id === bill.id);
  if (payment) return "pending";
  return "belum_bayar";
}

function AdminBillsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get("page")) || 1;
  const quantity = Number(searchParams.get("quantity")) || 10;
  const search = searchParams.get("search") || "";

  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("semua");

  const fetchData = useCallback(async (searchValue = "") => {
    setLoading(true);
    try {
      const headers = {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
        Authorization: `Bearer ${getToken()}`,
      };

      const [billsRes, paymentsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/bills?page=1&quantity=9999&search=${searchValue}`,
          { headers, cache: "no-store" }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments?page=1&quantity=9999`,
          { headers, cache: "no-store" }
        ),
      ]);

      const billsData = await billsRes.json();
      const paymentsData = await paymentsRes.json();

      if (billsData.success) {
        setBills(billsData.data);
      }
      if (paymentsData.success) {
        setPayments(paymentsData.data);
      }
    } catch (error) {
      console.error("Fetch bills error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(search); }, [search, fetchData]);

  const filteredBills = bills.filter((bill) => {
    if (activeFilter === "semua") return true;
    return getBillStatus(bill, payments) === activeFilter;
  });

  const totalFilteredCount = filteredBills.length;
  const startIndex = (page - 1) * quantity;
  const paginatedBills = filteredBills.slice(startIndex, startIndex + quantity);

  const handleFilterChange = (val: FilterStatus) => {
    setActiveFilter(val);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  const totalRevenue = paginatedBills.reduce((s, b) => s + b.price, 0);
  const totalUsage = paginatedBills.reduce((s, b) => s + b.usage_value, 0);

  const statusCounts = {
    all: bills.length,
    lunas: bills.filter(b => getBillStatus(b, payments) === "lunas").length,
    pending: bills.filter(b => getBillStatus(b, payments) === "pending").length,
    belum_bayar: bills.filter(b => getBillStatus(b, payments) === "belum_bayar").length,
  };

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
            <div className="text-3xl font-bold">{bills.length}</div>
            <p className="text-xs text-blue-100 mt-1">Semua tagihan</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Sudah Dibayar</CardTitle>
            <DollarSign className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statusCounts.lunas}</div>
            <p className="text-xs text-green-100 mt-1">Tagihan lunas</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Belum Dibayar</CardTitle>
            <TrendingUp className="h-5 w-5 text-red-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statusCounts.belum_bayar}</div>
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
                    — hasil pencarian &quot;{search}&quot;
                  </span>
                )}
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 shadow-sm px-2 py-1 h-[42px]">
                <label className="text-sm text-gray-500 font-medium pl-2">Status:</label>
                <select
                  value={activeFilter}
                  onChange={(e) => handleFilterChange(e.target.value as FilterStatus)}
                  className="bg-transparent border-none text-sm text-gray-700 focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="semua">Semua</option>
                  <option value="belum_bayar">Belum Bayar</option>
                  <option value="pending">Pending Verifikasi</option>
                  <option value="lunas">Verified / Lunas</option>
                </select>
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
              />
            </div>
          </div>
        </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {search ? `Tagihan "${search}" tidak ditemukan` : "Belum ada tagihan sesuai filter"}
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
                  {paginatedBills.map((bill, index) => {
                    const status = getBillStatus(bill, payments);
                    return (
                      <TableRow key={bill.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {startIndex + index + 1}
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
                          {status === "lunas" && (
                            <Badge className="bg-green-100 text-green-700 border-green-300">Lunas</Badge>
                          )}
                          {status === "pending" && (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Pending</Badge>
                          )}
                          {status === "belum_bayar" && (
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary & Pagination */}
      {totalFilteredCount > 0 && (
        <>
          <div className="mt-6 bg-white rounded-xl border shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Sesuai Filter</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalFilteredCount}</p>
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
            {totalFilteredCount > quantity && (
              <SimplePagination count={totalFilteredCount} perPage={quantity} currentPage={page} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function BillsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
    }>
      <AdminBillsContent />
    </Suspense>
  );
}