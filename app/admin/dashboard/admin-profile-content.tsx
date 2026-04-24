'use client';
import React from 'react';
import {
  Users,
  Droplets,
  FileText,
  TrendingUp,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface AdminProfileProps {
  adminData: any;
  dashboardStats: any;
  error: boolean;
}

const PIE_COLORS = ['#22c55e', '#eab308', '#ef4444'];

export function AdminProfileContent({ adminData, dashboardStats, error }: AdminProfileProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (error || !adminData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <Droplets className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600">Maaf, data admin tidak dapat dimuat.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Pelanggan',
      value: (dashboardStats?.totalCustomers ?? 0).toLocaleString('id-ID'),
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Layanan Aktif',
      value: (dashboardStats?.totalServices ?? 0).toLocaleString('id-ID'),
      icon: <Droplets className="w-6 h-6" />,
      color: 'bg-cyan-500'
    },
    {
      title: 'Tagihan Menunggu',
      value: (dashboardStats?.totalBilling ?? 0).toLocaleString('id-ID'),
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      title: 'Total Pembayaran',
      value: (dashboardStats?.totalPayments ?? 0).toLocaleString('id-ID'),
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-1">
          Selamat Datang kembali, {adminData.name}! 👋
        </h2>
        <p className="text-slate-500 text-sm">
          Dashboard overview Sistem PDAM —{' '}
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-600">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1: Status & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Status Pembayaran</CardTitle>
            <CardDescription>Distribusi status tagihan & pembayaran</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardStats?.paymentStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(dashboardStats?.paymentStatus || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Tren Pendapatan Bulanan</CardTitle>
            <CardDescription>Berdasarkan pembayaran yang telah diverifikasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardStats?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(val) => `Rp ${val / 1000}k`} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
</CardContent>
        </Card>
      </div>

      {/* Row 2: Bills vs Paid */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Total Tagihan vs Total Dibayar</CardTitle>
          <CardDescription>Perbandingan jumlah tagihan yang dicetak dengan pendapatan masuk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardStats?.billsVsPaid || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(val) => `Rp ${val / 1000}k`} />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="bills" name="Total Tagihan" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Total Dibayar" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Water Usage & Admin Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Penggunaan Air Tertinggi</CardTitle>
            <CardDescription>10 pelanggan dengan penggunaan air terbanyak (m³)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardStats?.waterUsagePerCustomer || []} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="usage" name="Pemakaian (m³)" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Kinerja Admin Verifikasi</CardTitle>
            <CardDescription>Jumlah pembayaran yang diverifikasi per admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardStats?.adminPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="verifiedCount" name="Verifikasi" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-yellow-500" />
              Pelanggan Teratas
            </CardTitle>
            <CardDescription>Berdasarkan total pembayaran terverifikasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(dashboardStats?.topPayingCustomers || []).map((customer: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{customer.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{customer.customer_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(customer.totalAmount)}</p>
                  </div>
                </div>
              ))}
              {(!dashboardStats?.topPayingCustomers || dashboardStats.topPayingCustomers.length === 0) && (
                <p className="text-center text-gray-500 text-sm py-4">Belum ada data pelanggan</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Tunggakan Tagihan Terbanyak
            </CardTitle>
            <CardDescription>Pelanggan dengan total tagihan belum dibayar tertinggi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(dashboardStats?.unpaidCustomers || []).map((customer: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{customer.name}</p>
                    <p className="text-xs text-red-600">{customer.unpaidBills} Tagihan Menunggak</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-700">{formatCurrency(customer.totalUnpaid)}</p>
                  </div>
                </div>
              ))}
              {(!dashboardStats?.unpaidCustomers || dashboardStats.unpaidCustomers.length === 0) && (
                <p className="text-center text-gray-500 text-sm py-4">Tidak ada tunggakan pelanggan</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Recent Payments */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Pembayaran Terbaru</CardTitle>
          <CardDescription>10 transaksi pembayaran terakhir yang masuk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3">Pelanggan</th>
                  <th className="px-4 py-3">Tanggal Bayar</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Bukti</th>
                </tr>
              </thead>
              <tbody>
                {(dashboardStats?.recentPayments || []).map((payment: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {payment.bill?.customer?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(payment.payment_date).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {formatCurrency(payment.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {payment.verified ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {payment.payment_proof ? (
                        <a 
                          href={`${process.env.NEXT_PUBLIC_BASE_API_URL}/payment-proof/${payment.payment_proof}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Lihat Bukti
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!dashboardStats?.recentPayments || dashboardStats.recentPayments.length === 0) && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-500">
                      Belum ada transaksi pembayaran
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
