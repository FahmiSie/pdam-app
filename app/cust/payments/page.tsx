"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, Clock, Search as SearchIcon, Receipt } from "lucide-react";
import SimplePagination from "@/components/Pagination";

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

interface Payment {
  id: number;
  bill_id: number;
  payment_date: string;
  verified: boolean;
  total_amount: number;
  payment_proof: string;
  createdAt: string;
  bill: {
    id: number;
    month: number;
    year: number;
    measurement_number: string;
    usage_value: number;
    price: number;
    paid: boolean;
    service: { name: string; };
    admin: { name: string; };
  };
}

function getToken() { return Cookies.get("accessToken"); }

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function CustPaymentsPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const quantity = Number(searchParams.get("quantity")) || 10;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  const fetchPayments = useCallback(async (searchValue = "") => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments/customer?page=${page}&quantity=${quantity}&search=${searchValue}`,
        {
          headers: {
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
          cache: "no-store",
        }
      );
      const result = await res.json();
      if (result.success) {
        setPayments(result.data);
        setCount(result.count);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, quantity]);

  useEffect(() => { fetchPayments(searchInput); }, [page, quantity]);

  useEffect(() => {
    const t = setTimeout(() => fetchPayments(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const verifiedCount = payments.filter(p => p.verified).length;
  const pendingCount = payments.filter(p => !p.verified).length;
  const totalAmount = payments.reduce((s, p) => s + p.total_amount, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Riwayat Pembayaran</h1>
        <p className="text-gray-500 mt-1">Lihat semua riwayat pembayaran tagihan Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Pembayaran</CardTitle>
            <CreditCard className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{count}</div>
            <p className="text-xs text-blue-100 mt-1">Transaksi</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Terverifikasi</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{verifiedCount}</div>
            <p className="text-xs text-green-100 mt-1">Pembayaran dikonfirmasi</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100">Menunggu Verifikasi</CardTitle>
            <Clock className="h-5 w-5 text-yellow-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
            <p className="text-xs text-yellow-100 mt-1">Sedang diproses</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Riwayat Transaksi</CardTitle>
              <CardDescription>Semua transaksi pembayaran tagihan PDAM</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari pembayaran..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada riwayat pembayaran</h3>
              <p className="mt-2 text-sm text-gray-500">Bayar tagihan Anda di halaman Tagihan</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>No</TableHead>
                      <TableHead>Payments</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead className="text-center">Tanggal Bayar</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Bukti</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment, index) => (
                      <TableRow key={payment.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {(page - 1) * quantity + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {MONTH_NAMES[payment.bill?.month]} {payment.bill?.year}
                          </div>
                          <div className="text-xs text-gray-400">
                            Pemakaian: {payment.bill?.usage_value} m³
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {payment.bill?.service?.name ?? "-"}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                          {formatDate(payment.payment_date)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(payment.total_amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {payment.payment_proof ? (
                            <a
                              href={`${process.env.NEXT_PUBLIC_BASE_API_URL}/payments/proof/${payment.payment_proof}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 underline hover:text-blue-800"
                            >
                              Lihat Bukti
                            </a>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {payment.verified ? (
                            <Badge className="bg-green-100 text-green-700 border-green-300">Terverifikasi</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Menunggu</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {count > quantity && (
                <div className="mt-4 flex justify-center">
                  <SimplePagination count={count} perPage={quantity} currentPage={page} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}