"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  FileText, Upload, CheckCircle, Clock,
  Search as SearchIcon, AlertCircle,
} from "lucide-react";
import SimplePagination from "@/components/Pagination";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

const MONTH_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

interface Service {
  id: number;
  name: string;
  min_usage: number;
  max_usage: number;
  price: number;
}

interface Bill {
  id: number;
  customer_id: number;
  admin_id: number;
  month: number;
  year: number;
  measurement_number: string;
  usage_value: number;
  price: number;
  service_id: number;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
  service: Service;
  admin: { id: number; name: string };
  customer: { id: number; name: string; customer_number: string };
}

interface Payment {
  id: number;
  bill_id: number;
  verified: boolean;
}

// ─── Filter type ──────────────────────────────────────────────────────────────
type FilterStatus = "semua" | "lunas" | "pending" | "belum_bayar";

function getToken() {
  return Cookies.get("accessToken");
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
}

type BillStatus = "lunas" | "pending" | "belum_bayar";

function getBillStatus(bill: Bill, payments: Payment[]): BillStatus {
  if (bill.paid) return "lunas";
  const payment = payments.find((p) => p.bill_id === bill.id);
  if (payment) return "pending";
  return "belum_bayar";
}

function StatusBadge({ status }: { status: BillStatus }) {
  if (status === "lunas") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
        <CheckCircle className="w-3 h-3" /> Lunas
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 gap-1">
        <Clock className="w-3 h-3" /> Menunggu Verifikasi
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-600 border-red-200 gap-1">
      <AlertCircle className="w-3 h-3" /> Belum Bayar
    </Badge>
  );
}

// ─── Filter Tab config ────────────────────────────────────────────────────────
// Using select dropdown directly instead of tabs


// ─── Upload Payment Modal ─────────────────────────────────────────────────────
function UploadPayment({ bill, onSuccess }: { bill: Bill; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.warning("Pilih file bukti pembayaran"); return; }
    setIsLoading(true);

    const formData = new FormData();
    formData.append("bill_id", String(bill.id));
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments`,
        {
          method: "POST",
          headers: {
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        }
      );
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || "Bukti pembayaran berhasil dikirim, menunggu verifikasi admin");
        setOpen(false);
        setFile(null);
        onSuccess();
      } else {
        toast.warning(result.message || "Gagal mengirim pembayaran");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setFile(null); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 h-8">
          <Upload className="w-3.5 h-3.5" /> Bayar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Bukti Pembayaran</DialogTitle>
            <DialogDescription>
              Tagihan {MONTH_NAMES[bill.month]} {bill.year} — {formatCurrency(bill.price)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Bukti Pembayaran *</Label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              {file && (
                <p className="text-xs text-green-600">✓ File dipilih: {file.name}</p>
              )}
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 space-y-1">
              <p className="font-medium">Detail Tagihan:</p>
              <p>Bulan: {MONTH_NAMES[bill.month]} {bill.year}</p>
              <p>No. Meteran: {bill.measurement_number}</p>
              <p>Pemakaian: {bill.usage_value} m³</p>
              <p>Total: {formatCurrency(bill.price)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? "Mengirim..." : "Kirim Pembayaran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function CustBillsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get("page")) || 1;
  const quantity = Number(searchParams.get("quantity")) || 10;

  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  // ✅ State filter baru
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("semua");

  const headers = {
    "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
    Authorization: `Bearer ${getToken()}`,
  };

  const fetchData = useCallback(
    async (searchValue = "") => {
      setLoading(true);
      try {
        const [billsRes, paymentsRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/bills/me?page=1&quantity=9999&search=${searchValue}`,
            { headers, cache: "no-store" }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments/me?page=1&quantity=9999`,
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [page, quantity]
  );

  useEffect(() => { fetchData(searchInput); }, [page, quantity]);

  useEffect(() => {
    const t = setTimeout(() => fetchData(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ✅ Hitung jumlah per status (dari semua bills yang ter-load)
  const paidCount     = bills.filter((b) => b.paid).length;
  const pendingCount  = bills.filter((b) => !b.paid && payments.some((p) => p.bill_id === b.id)).length;
  const unpaidCount   = bills.filter((b) => !b.paid && !payments.some((p) => p.bill_id === b.id)).length;

  const statusCounts = {
    all: bills.length,
    lunas: paidCount,
    pending: pendingCount,
    belum_bayar: unpaidCount,
  };

  // ✅ Filter bills berdasarkan dropdown aktif (client-side)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tagihan Saya</h1>
        <p className="text-gray-500 mt-1">Lihat dan bayar tagihan air PDAM Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Tagihan</CardTitle>
            <FileText className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bills.length}</div>
            <p className="text-xs text-blue-100 mt-1">Semua tagihan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Sudah Dibayar</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paidCount}</div>
            <p className="text-xs text-green-100 mt-1">Tagihan lunas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100">Menunggu Verifikasi</CardTitle>
            <Clock className="h-5 w-5 text-yellow-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
            <p className="text-xs text-yellow-100 mt-1">Sedang diproses admin</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Belum Dibayar</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{unpaidCount}</div>
            <p className="text-xs text-red-100 mt-1">Perlu dibayar</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Daftar Tagihan</CardTitle>
              <CardDescription>Riwayat tagihan air PDAM Anda</CardDescription>
            </div>
            {/* Search */}
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari tagihan..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* ✅ Filter Dropdown */}
          <div className="flex flex-wrap gap-3 mt-4 items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm w-fit">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap pl-2">Filter Status:</label>
            <select
              value={activeFilter}
              onChange={(e) => handleFilterChange(e.target.value as FilterStatus)}
              className="text-sm border-gray-200 rounded-lg bg-gray-50 text-gray-700 py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="semua">Semua Tagihan ({statusCounts.all})</option>
              <option value="belum_bayar">Belum Bayar ({statusCounts.belum_bayar})</option>
              <option value="pending">Pending Verifikasi ({statusCounts.pending})</option>
              <option value="lunas">Verified / Lunas ({statusCounts.lunas})</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                {activeFilter === "semua"
                  ? "Belum ada tagihan"
                  : "Tidak ada tagihan dengan status yang dipilih"}
              </h3>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>No</TableHead>
                      <TableHead>Bulan / Tahun</TableHead>
                      <TableHead>No. Meteran</TableHead>
                      <TableHead className="text-center">Pemakaian</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead className="text-right">Total Tagihan</TableHead>
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
                            <div className="font-medium">{MONTH_NAMES[bill.month]}</div>
                            <div className="text-xs text-gray-400">{bill.year}</div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {bill.measurement_number}
                          </TableCell>
                          <TableCell className="text-center">{bill.usage_value} m³</TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {bill.service?.name ?? "-"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {bill.service?.min_usage}-{bill.service?.max_usage} m³
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            {formatCurrency(bill.price)}
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={status} />
                          </TableCell>
                          <TableCell className="text-center">
                            {status === "belum_bayar" && (
                              <UploadPayment
                                bill={bill}
                                onSuccess={() => fetchData(searchInput)}
                              />
                            )}
                            {status === "pending" && (
                              <span className="text-xs text-yellow-600 flex items-center gap-1 justify-center">
                                <Clock className="w-3 h-3" /> Menunggu verifikasi
                              </span>
                            )}
                            {status === "lunas" && (
                              <span className="text-xs text-green-600 flex items-center gap-1 justify-center">
                                <CheckCircle className="w-3 h-3" /> Lunas
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {totalFilteredCount > quantity && (
                <div className="mt-4 flex justify-center">
                  <SimplePagination count={totalFilteredCount} perPage={quantity} currentPage={page} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustBillsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading...
        </div>
      }
    >
      <CustBillsContent />
    </Suspense>
  );
}