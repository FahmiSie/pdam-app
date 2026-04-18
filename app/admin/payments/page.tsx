"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
  Receipt, ExternalLink, ShieldCheck, Trash2, Eye, Printer,
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
    service: { name: string };
    admin: { name: string };
    customer: { id: number; name: string; customer_number: string };
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

// ─── Print Handler ────────────────────────────────────────────────────────────
function handlePrint(payment: Payment, proofUrl: string) {
  const printWindow = window.open("", "_blank", "width=820,height=960");
  if (!printWindow) {
    toast.error("Popup diblokir browser. Izinkan popup untuk mencetak.");
    return;
  }

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(payment.payment_proof ?? "");
  const printedAt = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  printWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Kuitansi #PAY-${String(payment.id).padStart(5, "0")}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a1a;padding:36px 40px;font-size:13px;line-height:1.5}

    /* ── Header ── */
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:18px;border-bottom:2.5px solid #1d4ed8;margin-bottom:22px}
    .brand-name{font-size:20px;font-weight:700;color:#1d4ed8;letter-spacing:-0.3px}
    .brand-sub{font-size:11px;color:#6b7280;margin-top:2px}
    .receipt-title{font-size:15px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.06em;text-align:right}
    .receipt-no{font-size:11px;color:#6b7280;text-align:right;margin-top:3px}

    /* ── Status ── */
    .status-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:20px}
    .pill-green{background:#dcfce7;color:#15803d;border:1px solid #86efac}
    .pill-yellow{background:#fef9c3;color:#a16207;border:1px solid #fde047}

    /* ── Sections ── */
    .section-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin-bottom:9px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 28px;margin-bottom:20px}
    .info-item{display:flex;flex-direction:column;gap:2px}
    .info-key{font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af}
    .info-val{font-size:13px;font-weight:500;color:#111827}

    /* ── Divider ── */
    .divider{border:none;border-top:1px dashed #d1d5db;margin:18px 0}

    /* ── Total ── */
    .total-box{background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}
    .total-label{font-size:13px;font-weight:600;color:#1d4ed8}
    .total-val{font-size:22px;font-weight:700;color:#1d4ed8}

    /* ── Proof ── */
    .proof-box{margin-bottom:22px}
    .proof-img{width:100%;max-height:300px;object-fit:contain;border:1px solid #e5e7eb;border-radius:8px;margin-top:8px;display:block}
    .proof-link{display:inline-flex;align-items:center;gap:4px;color:#2563eb;font-size:12px;margin-top:8px;word-break:break-all;text-decoration:underline}

    /* ── Footer ── */
    .footer{display:flex;justify-content:space-between;align-items:flex-end;padding-top:18px;border-top:1px solid #e5e7eb;margin-top:8px}
    .footer-note{font-size:10px;color:#9ca3af;line-height:1.6;max-width:300px}
    .ttd{text-align:center}
    .ttd-line{width:140px;border-bottom:1px solid #374151;margin:44px auto 7px}
    .ttd-name{font-size:12px;font-weight:600;color:#374151}
    .ttd-role{font-size:10px;color:#9ca3af}

    @media print{body{padding:14px}@page{margin:10mm;size:A4}}
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="brand-name">PDAM Tirta Sejahtera</div>
      <div class="brand-sub">Perusahaan Daerah Air Minum</div>
    </div>
    <div>
      <div class="receipt-title">Kuitansi Pembayaran</div>
      <div class="receipt-no">No. #PAY-${String(payment.id).padStart(5, "0")}</div>
    </div>
  </div>

  <div class="status-pill ${payment.verified ? "pill-green" : "pill-yellow"}">
    ${payment.verified ? "✓ Pembayaran Terverifikasi" : "⏳ Menunggu Verifikasi Admin"}
  </div>

  <div class="section-label">Informasi Pelanggan</div>
  <div class="info-grid">
    <div class="info-item"><span class="info-key">Nama</span><span class="info-val">${payment.bill?.customer?.name ?? "-"}</span></div>
    <div class="info-item"><span class="info-key">No. Pelanggan</span><span class="info-val">${payment.bill?.customer?.customer_number ?? "-"}</span></div>
    <div class="info-item"><span class="info-key">Layanan</span><span class="info-val">${payment.bill?.service?.name ?? "-"}</span></div>
    <div class="info-item"><span class="info-key">No. Meteran</span><span class="info-val">${payment.bill?.measurement_number ?? "-"}</span></div>
  </div>

  <hr class="divider"/>

  <div class="section-label">Detail Tagihan</div>
  <div class="info-grid">
    <div class="info-item"><span class="info-key">Periode</span><span class="info-val">${MONTH_NAMES[payment.bill?.month]} ${payment.bill?.year}</span></div>
    <div class="info-item"><span class="info-key">Pemakaian</span><span class="info-val">${payment.bill?.usage_value ?? 0} m³</span></div>
    <div class="info-item"><span class="info-key">Tanggal Bayar</span><span class="info-val">${formatDate(payment.payment_date)}</span></div>
    <div class="info-item"><span class="info-key">ID Transaksi</span><span class="info-val">#PAY-${String(payment.id).padStart(5, "0")}</span></div>
  </div>

  <div class="total-box">
    <span class="total-label">Total Pembayaran</span>
    <span class="total-val">${formatCurrency(payment.total_amount)}</span>
  </div>

  <div class="proof-box">
    <div class="section-label">Bukti Pembayaran</div>
    ${isImage
      ? `<img src="${proofUrl}" alt="Bukti Pembayaran" class="proof-img"/>`
      : `<a href="${proofUrl}" class="proof-link" target="_blank">📎 ${payment.payment_proof}</a>`
    }
  </div>

  <div class="footer">
    <div class="footer-note">
      Dicetak: ${printedAt}<br/>
      Dokumen ini merupakan bukti pembayaran resmi dari PDAM Tirta Sejahtera.<br/>
      Simpan dokumen ini sebagai arsip pembayaran Anda.
    </div>
    <div class="ttd">
      <div class="ttd-line"></div>
      <div class="ttd-name">${payment.bill?.admin?.name ?? "Petugas PDAM"}</div>
      <div class="ttd-role">Petugas Verifikasi</div>
    </div>
  </div>

</body>
</html>`);

  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 450);
  };
}

// ─── Proof Image Modal ────────────────────────────────────────────────────────
function ProofImageModal({ payment }: { payment: Payment }) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const proofUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL}/payment-proof/${payment.payment_proof}`;

  if (!payment.payment_proof) return <span className="text-xs text-gray-400">-</span>;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setImgError(false); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
          <Eye className="w-3 h-3" /> Lihat Bukti
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bukti Pembayaran</DialogTitle>
          <DialogDescription>
            {payment.bill?.customer?.name} —{" "}
            {MONTH_NAMES[payment.bill?.month]} {payment.bill?.year}
            {" · "}
            <span className="font-medium text-gray-700">
              {formatCurrency(payment.total_amount)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-3">
          {/* Proof preview */}
          {!imgError ? (
            <img
              src={proofUrl}
              alt="Bukti Pembayaran"
              className="w-full rounded-lg border object-contain max-h-72"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="p-6 bg-gray-50 rounded-lg text-center border border-dashed">
              <Receipt className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-3">
                File tidak dapat ditampilkan sebagai gambar
              </p>
              <a
                href={proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> Buka File
              </a>
            </div>
          )}

          {/* Info ringkas */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded-lg p-3 border">
            <div>
              <span className="text-gray-400 block">Pelanggan</span>
              <span className="font-medium text-gray-700">
                {payment.bill?.customer?.name ?? "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">No. Pelanggan</span>
              <span className="font-medium text-gray-700 font-mono">
                {payment.bill?.customer?.customer_number ?? "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Periode</span>
              <span className="font-medium text-gray-700">
                {MONTH_NAMES[payment.bill?.month]} {payment.bill?.year}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Tanggal Bayar</span>
              <span className="font-medium text-gray-700">
                {formatDate(payment.payment_date)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:items-center">
          {/* Buka di tab baru — di kiri */}
          <a
            href={proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 sm:mr-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Buka di Tab Baru
          </a>

          <Button variant="outline" onClick={() => setOpen(false)}>
            Tutup
          </Button>

          {/* ✅ Cetak Kuitansi */}
          <Button
            className="gap-1.5 bg-blue-600 hover:bg-blue-700"
            onClick={() => handlePrint(payment, proofUrl)}
          >
            <Printer className="w-4 h-4" />
            Cetak Kuitansi
          </Button>
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
    return (
      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
        Terverifikasi
      </Badge>
    );
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
            Konfirmasi pembayaran dari{" "}
            <strong>{payment.bill?.customer?.name}</strong> untuk tagihan{" "}
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
            Hapus data pembayaran dari{" "}
            <strong>{payment.bill?.customer?.name}</strong>?
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
  const router = useRouter();
  const pathname = usePathname();
  const page     = Number(searchParams.get("page"))     || 1;
  const quantity = Number(searchParams.get("quantity")) || 10;

  const [payments, setPayments]     = useState<Payment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [activeFilter, setActiveFilter] = useState<"semua" | "pending" | "verified">("semua");

  const fetchPayments = useCallback(async (searchValue = "") => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/payments?page=1&quantity=9999&search=${searchValue}`,
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
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPayments(searchInput); }, [fetchPayments, searchInput]);

  const verifiedCount = payments.filter(p => p.verified).length;
  const pendingCount  = payments.filter(p => !p.verified).length;

  const filteredPayments = payments.filter((payment) => {
    if (activeFilter === "semua") return true;
    if (activeFilter === "pending") return !payment.verified;
    if (activeFilter === "verified") return payment.verified;
    return true;
  });

  const totalFilteredCount = filteredPayments.length;
  const startIndex = (page - 1) * quantity;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + quantity);
  const totalAmount   = paginatedPayments.reduce((s, p) => s + p.total_amount, 0);

  const handleFilterChange = (val: string) => {
    setActiveFilter(val as any);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Pembayaran</h1>
        <p className="text-gray-500 mt-1">Kelola dan verifikasi pembayaran dari pelanggan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Pembayaran</CardTitle>
            <CreditCard className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{payments.length}</div>
            <p className="text-xs text-blue-100 mt-1">Transaksi</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Terverifikasi</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{verifiedCount}</div>
            <p className="text-xs text-green-100 mt-1">Pembayaran dikonfirmasi</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100">Menunggu Verifikasi</CardTitle>
            <Clock className="h-5 w-5 text-yellow-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
            <p className="text-xs text-yellow-100 mt-1">Perlu ditindaklanjuti</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
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
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 shadow-sm">
                <label className="text-sm font-medium text-gray-500">Status:</label>
                <select
                  value={activeFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="bg-transparent border-none text-sm text-gray-700 outline-none cursor-pointer focus:ring-0"
                >
                  <option value="semua">Semua</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                </select>
              </div>

              <div className="relative w-full md:w-64">
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
                    {paginatedPayments.map((payment, index) => (
                      <TableRow key={payment.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {startIndex + index + 1}
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
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                              Terverifikasi
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                              Menunggu
                            </Badge>
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

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    }>
      <AdminPaymentsContent />
    </Suspense>
  );
}