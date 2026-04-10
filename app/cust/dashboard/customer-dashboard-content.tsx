"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, CreditCard, CheckCircle, AlertCircle,
  Droplets, User, Phone, MapPin, Calendar,
} from "lucide-react";
import Link from "next/link";

interface CustomerProfile {
  id: number;
  name: string;
  customer_number: string;
  phone: string;
  address: string;
  createdAt: string;
  user: { username: string; role: string; };
  service: {
    name: string;
    min_usage: number;
    max_usage: number;
    price: number;
  };
}

interface Bill {
  id: number;
  month: number;
  year: number;
  usage_value: number;
  price: number;
  paid: boolean;
  amount: number;
  payments: { verified: boolean } | null;
}

interface Payment {
  id: number;
  verified: boolean;
  total_amount: number;
  payment_date: string;
}

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

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

export default function CustDashboardPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const token = getToken();
      const headers = {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
        Authorization: `Bearer ${token}`,
      };

      try {
        const [profileRes, billsRes, paymentsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/me`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/bills/customer?page=1&quantity=99999`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/payments/customer?page=1&quantity=99999`, { headers }),
        ]);

        const [profileData, billsData, paymentsData] = await Promise.all([
          profileRes.json(),
          billsRes.json(),
          paymentsRes.json(),
        ]);

        if (profileData.success) setProfile(profileData.data);
        if (billsData.success) setBills(billsData.data);
        if (paymentsData.success) setPayments(paymentsData.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Stats
  const totalBills = bills.length;
  const paidBills = bills.filter(b => b.paid).length;
  const unpaidBills = bills.filter(b => !b.paid && !b.payments).length;
  const pendingBills = bills.filter(b => !b.paid && b.payments).length;
  const totalPayments = payments.length;
  const verifiedPayments = payments.filter(p => p.verified).length;

  // Tagihan terbaru yang belum dibayar
  const unpaidBillsList = bills.filter(b => !b.paid).slice(0, 3);

  // Pembayaran terbaru
  const recentPayments = payments.slice(0, 3);

  const initials = profile?.name?.slice(0, 2).toUpperCase() ?? "CU";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Selamat datang, {profile?.name ?? "Customer"}!
            </h1>
            <p className="text-gray-500 mt-0.5">
              No. Pelanggan: <span className="font-mono font-semibold">{profile?.customer_number ?? "-"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Tagihan</CardTitle>
            <FileText className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBills}</div>
            <p className="text-xs text-blue-100 mt-1">{paidBills} sudah lunas</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Belum Dibayar</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{unpaidBills}</div>
            <p className="text-xs text-red-100 mt-1">Perlu segera dibayar</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100">Menunggu Verifikasi</CardTitle>
            <CreditCard className="h-5 w-5 text-yellow-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingBills}</div>
            <p className="text-xs text-yellow-100 mt-1">Sedang diproses</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Pembayaran Terverifikasi</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{verifiedPayments}</div>
            <p className="text-xs text-green-100 mt-1">dari {totalPayments} transaksi</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Akun */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Nama</p>
                <p className="text-sm font-semibold">{profile?.name ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Telepon</p>
                <p className="text-sm font-semibold">{profile?.phone ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Alamat</p>
                <p className="text-sm font-semibold">{profile?.address ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Terdaftar</p>
                <p className="text-sm font-semibold">{profile ? formatDate(profile.createdAt) : "-"}</p>
              </div>
            </div>
            {/* Paket Layanan */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-blue-500" />
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Paket Layanan</p>
              </div>
              <p className="text-sm font-bold text-blue-800">{profile?.service?.name ?? "-"}</p>
              <p className="text-xs text-blue-600">
                {profile?.service?.min_usage}-{profile?.service?.max_usage} m³ / bulan
              </p>
              <p className="text-sm font-semibold text-blue-700 mt-1">
                {profile?.service ? formatCurrency(profile.service.price) : "-"}
              </p>
            </div>

            <Link href="/cust/profile">
              <button className="w-full mt-2 text-xs text-blue-600 hover:text-blue-800 underline text-center">
                Edit Profil →
              </button>
            </Link>
          </CardContent>
        </Card>

        {/* Tagihan Belum Dibayar */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Tagihan Belum Dibayar
              </CardTitle>
              <Link href="/cust/bills">
                <span className="text-xs text-blue-600 hover:underline">Lihat semua →</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {unpaidBillsList.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-10 w-10 text-green-400" />
                <p className="mt-3 text-sm font-medium text-gray-700">Semua tagihan sudah dibayar!</p>
                <p className="text-xs text-gray-400 mt-1">Tidak ada tagihan yang tertunggak</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unpaidBillsList.map((bill) => (
                  <div key={bill.id} className="p-3 border border-red-100 rounded-lg bg-red-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {MONTH_NAMES[bill.month]} {bill.year}
                        </p>
                        <p className="text-xs text-gray-500">Pemakaian: {bill.usage_value} m³</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{formatCurrency(bill.amount)}</p>
                        {bill.payments ? (
                          <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300">Menunggu</Badge>
                        ) : (
                          <Badge className="text-xs bg-red-100 text-red-600 border-red-200">Belum Bayar</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/cust/bills">
                  <button className="w-full mt-2 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Bayar Sekarang
                  </button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Riwayat Pembayaran Terbaru */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-500" />
                Pembayaran Terbaru
              </CardTitle>
              <Link href="/cust/payments">
                <span className="text-xs text-blue-600 hover:underline">Lihat semua →</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">Belum ada riwayat pembayaran</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{formatCurrency(payment.total_amount)}</p>
                      <p className="text-xs text-gray-400">{formatDate(payment.payment_date)}</p>
                    </div>
                    {payment.verified ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Terverifikasi</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">Menunggu</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}