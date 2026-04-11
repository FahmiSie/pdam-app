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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard, CheckCircle, Clock, Search as SearchIcon,
  Receipt, ExternalLink, ShieldCheck, Trash2, Eye,
} from "lucide-react";
import SimplePagination from "@/components/Pagination";
import { toast } from "sonner";

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
    customer: { id: number; name: string; customer_number: string; };
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

// ─── Proof Image Modal ────────────────────────────────────────────────────────
function ProofImageModal({ payment }: { payment: Payment }) {
  const [open, setOpen] = useState(false);
  const proofUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL}/payment-proof/${payment.payment_proof}`;

  if (!payment.payment_proof) return <span className="text-xs text-gray-400">-</span>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
          <Eye className="w-3 h-3" /> Lihat Bukti
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bukti Pembayaran</DialogTitle>
          <DialogDescription>
            {payment.bill?.customer?.name} — {MONTH_NAMES[payment.bill?.month]} {payment.bill?.year}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <img
            src={proofUrl}
            alt="Bukti Pembayaran"
            className="w-full rounded-lg border object-contain max-h-96"
            onError={(e) => {
              // If not image, show link
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.removeAttribute("hidden");
            }}
          />
          <div hidden className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">File tidak dapat ditampilkan sebagai gambar</p>
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Buka File
            </a>
          </div>
        </div>
        <DialogFooter>
          <a
            href={proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Buka di Tab Baru
          </a>
          <Button variant="outline" onClick={() => setOpen(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Verify Payment ───────────────────────────────────────────────────────────
function VerifyPayment({ payment, onSuccess }: { payment: Payment; onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments/${payment.id}`,
        {
          method: "PATCH",
          headers: {
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || "Pembayaran berhasil diverifikasi");
        onSuccess();
      } else {
        toast.warning(result.message || "Gagal memverifikasi pembayaran");
      }
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setIsLoading(false); }
  };

  if (payment.verified) {
    return <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Terverifikasi</Badge>;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1 text-xs bg-blue-600 hover:bg-blue-700">
          <ShieldCheck className="w-3 h-3" /> Verifikasi
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verifikasi Pembayaran?</AlertDialogTitle>
          <AlertDialogDescription>
            Konfirmasi pembayaran dari <strong>{payment.bill?.customer?.name}</strong> untuk tagihan{" "}
            <strong>{MONTH_NAMES[payment.bill?.month]} {payment.bill?.year}</strong> sebesar{" "}
            <strong>{formatCurrency(payment.total_amount)}</strong>.
            <br /><br />
            Setelah diverifikasi, tagihan akan otomatis ditandai sebagai lunas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleVerify}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Memverifikasi..." : "Ya, Verifikasi"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Delete Payment ───────────────────────────────────────────────────────────
function DeletePayment({ payment, onSuccess }: { payment: Payment; onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments/${payment.id}`,
        {
          method: "DELETE",
          headers: {
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || "Pembayaran berhasil dihapus");
        onSuccess();
      } else {
        toast.warning(result.message || "Gagal menghapus pembayaran");
      }
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setIsLoading(false); }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pembayaran?</AlertDialogTitle>
          <AlertDialogDescription>
            Hapus data pembayaran dari <strong>{payment.bill?.customer?.name}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function AdminPaymentsContent() {
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
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments?page=${page}&quantity=${quantity}&search=${searchValue}`,
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
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Pembayaran</h1>
        <p className="text-gray-500 mt-1">Kelola dan verifikasi pembayaran dari pelanggan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <p className="text-xs text-yellow-100 mt-1">Perlu ditindaklanjuti</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Pendapatan</CardTitle>
            <Receipt className="h-5 w-5 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-purple-100 mt-1">Halaman ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Daftar Pembayaran</CardTitle>
              <CardDescription>Semua transaksi pembayaran dari pelanggan</CardDescription>
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
              <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada pembayaran</h3>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>No</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Tagihan</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead className="text-center">Tanggal Bayar</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Bukti</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment, index) => (
                      <TableRow key={payment.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {(page - 1) * quantity + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {payment.bill?.customer?.name ?? "-"}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {payment.bill?.customer?.customer_number ?? "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {MONTH_NAMES[payment.bill?.month]} {payment.bill?.year}
                          </div>
                          <div className="text-xs text-gray-400">
                            {payment.bill?.usage_value} m³
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
                          <ProofImageModal payment={payment} />
                        </TableCell>
                        <TableCell className="text-center">
                          {payment.verified ? (
                            <Badge className="bg-green-100 text-green-700 border-green-300">Terverifikasi</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Menunggu</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1.5">
                            {!payment.verified && (
                              <VerifyPayment
                                payment={payment}
                                onSuccess={() => fetchPayments(searchInput)}
                              />
                            )}
                            <DeletePayment
                              payment={payment}
                              onSuccess={() => fetchPayments(searchInput)}
                            />
                          </div>
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

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <AdminPaymentsContent />
    </Suspense>
  );
}