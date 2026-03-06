'use client';
import React, { useState } from 'react';
import { 
  Users, 
  Droplets, 
  FileText, 
  TrendingUp, 
  Search, 
  Bell,
  Settings,
  LogOut,
  Home,
  UserPen,
  User,
  Users as UsersIcon,
  Toolbox,
  Receipt,
  Banknote,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface AdminProfileProps {
  adminData: {
    id: number;
    user_id: number;
    name: string;
    phone: string;
    owner_token: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: number;
      username: string;
      password: string;
      role: string;
      owner_token: string;
      createdAt: string;
      updatedAt: string;
    };
  } | null;
  dashboardStats: {
    totalCustomers: number;
    totalServices: number;
    totalBilling: number;
    totalPayments: number;
    recentCustomers: any[];
    pendingBills: any[];
  } | null;
  error: boolean;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

export function AdminProfileContent({ adminData, dashboardStats, error }: AdminProfileProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState(3);

  // Debug: Log data yang diterima
  console.log("Dashboard Stats:", dashboardStats);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Generate stats dari real data
  const getStats = (): StatCard[] => {
    if (dashboardStats) {
      console.log("Using real dashboard stats");
      return [
        {
          title: 'Total Pelanggan',
          value: dashboardStats.totalCustomers.toLocaleString('id-ID'),
          change: '+12.5%',
          icon: <Users className="w-6 h-6" />,
          color: 'bg-blue-500'
        },
        {
          title: 'Layanan Aktif',
          value: dashboardStats.totalServices.toLocaleString('id-ID'),
          change: '+8.2%',
          icon: <Droplets className="w-6 h-6" />,
          color: 'bg-cyan-500'
        },
        {
          title: 'Tagihan Menunggu',
          value: dashboardStats.totalBilling.toLocaleString('id-ID'),
          change: '-5.3%',
          icon: <FileText className="w-6 h-6" />,
          color: 'bg-orange-500'
        },
        {
          title: 'Total Pembayaran',
          value: dashboardStats.totalPayments.toLocaleString('id-ID'),
          change: '+15.7%',
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'bg-green-500'
        }
      ];
    }
    
    console.log("Using fallback stats");
    // Fallback ke mock data jika tidak ada data dari API
    return [
      {
        title: 'Total Pelanggan',
        value: '0',
        change: '0%',
        icon: <Users className="w-6 h-6" />,
        color: 'bg-blue-500'
      },
      {
        title: 'Layanan Aktif',
        value: '0',
        change: '0%',
        icon: <Droplets className="w-6 h-6" />,
        color: 'bg-cyan-500'
      },
      {
        title: 'Tagihan Menunggu',
        value: '0',
        change: '0%',
        icon: <FileText className="w-6 h-6" />,
        color: 'bg-orange-500'
      },
      {
        title: 'Total Pembayaran',
        value: '0',
        change: '0%',
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'bg-green-500'
      }
    ];
  };

  const stats = getStats();

  if (error || !adminData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-blue-200">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <Droplets className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Error</h2>
          <p className="text-slate-600 text-center">
            Maaf, admin tidak ditemukan atau tidak dapat dimuat.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/admin/dashboard', active: true },
    { icon: Users, label: 'Pelanggan', href: '/admin/customer' },
    { icon: Toolbox, label: 'Layanan', href: '/admin/services' },
    { icon: Receipt, label: 'Tagihan', href: '/admin/billing' },
    { icon: Banknote, label: 'Pembayaran', href: '/admin/payments' },
    { icon: UserPen, label: 'Profil', href: '/admin/profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">PDAM System</h1>
                  <p className="text-xs text-slate-500">Perusahaan Daerah Air Minum</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Cari pelanggan, layanan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </Button>
              </div>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{adminData.name}</p>
                  <p className="text-xs text-slate-500">{adminData.user.role}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">
                    {adminData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg border-r border-blue-100 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 pt-8 border-t border-slate-200">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:text-slate-900"
              >
                <Settings className="w-5 h-5 mr-3" />
                Pengaturan
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Keluar
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Selamat Datang kembali, {adminData.name}! 👋
            </h2>
            <p className="text-slate-600">
              Dashboard overview Sistem PDAM - {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                      {stat.icon}
                    </div>
                    <Badge 
                      variant={stat.change.startsWith('+') ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                  <p className="text-sm text-slate-600">{stat.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Pelanggan Terbaru</span>
                </CardTitle>
                <CardDescription>5 pelanggan yang baru saja terdaftar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats?.recentCustomers && dashboardStats.recentCustomers.length > 0 ? (
                    <>
                      {console.log("Recent customers data:", dashboardStats.recentCustomers)}
                      {dashboardStats.recentCustomers.map((customer: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600">{customer.name?.charAt(0) || customer.customer_name?.charAt(0) || 'C'}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{customer.name || customer.customer_name || 'Unknown'}</p>
                              <p className="text-xs text-slate-500">ID: {customer.customer_number || customer.id || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {console.log("No recent customers found, data:", dashboardStats?.recentCustomers)}
                      <p className="text-center text-gray-500 py-4">Belum ada data pelanggan</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-orange-600" />
                  <span>Tagihan Menunggu Pembayaran</span>
                </CardTitle>
                <CardDescription>Tagihan yang perlu ditindaklanjuti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats?.pendingBills && dashboardStats.pendingBills.length > 0 ? (
                    dashboardStats.pendingBills.map((bill: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{bill.customer?.name || 'Unknown Customer'}</p>
                          <p className="text-xs text-orange-600">
                            {bill.status === 'pending' ? 'Menunggu Pembayaran' : bill.status || 'Status Unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            {bill.amount ? formatCurrency(bill.amount) : 'Rp 0'}
                          </p>
                          <Button variant="outline" size="sm" className="text-xs h-6">
                            Kirim Reminder
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Tidak ada tagihan menunggu pembayaran</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-slate-600" />
                <span>Informasi Sistem</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Status Sistem</h4>
                  <p className="text-xs text-blue-700">Online • Normal</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900 mb-1">Backup Terakhir</h4>
                  <p className="text-xs text-green-700">Hari ini, 02:00 WIB</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-900 mb-1">Versi Sistem</h4>
                  <p className="text-xs text-purple-700">v2.1.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
