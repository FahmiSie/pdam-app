"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, CreditCard } from "lucide-react";

interface Payment {
  id: number;
  verified: boolean;
  total_amount: number;
  payment_date: string;
  customer: {
    name: string;
    customer_number: string;
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      const token = Cookies.get("accessToken");
      const headers = {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments/admin?page=1&quantity=99999`,
          { headers }
        );
        const data = await response.json();
        if (data.success) {
          setPayments(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const verifiedCount = payments.filter((p) => p.verified).length;
  const pendingCount = payments.filter((p) => !p.verified).length;
  const totalAmount = payments.reduce((s, p) => s + p.total_amount, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Semua Pembayaran</h1>
        <p className="text-gray-500 mt-1">Kelola semua pembayaran dari pelanggan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Pembayaran</CardTitle>
            <CreditCard className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{payments.length}</div>
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
          <CardTitle>Daftar Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Pelanggan</th>
                  <th className="text-left p-4">Jumlah</th>
                  <th className="text-left p-4">Tanggal</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="p-4">
                      <div>
                        <div className="font-semibold">{payment.customer.name}</div>
                        <div className="text-sm text-gray-500">{payment.customer.customer_number}</div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{formatCurrency(payment.total_amount)}</td>
                    <td className="p-4">{formatDate(payment.payment_date)}</td>
                    <td className="p-4">
                      <Badge variant={payment.verified ? "default" : "secondary"}>
                        {payment.verified ? "Terverifikasi" : "Menunggu"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
