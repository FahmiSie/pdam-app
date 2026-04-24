"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Customer {
  id: number;
  name: string;
  customer_number: string;
  service_id: number;
  service: {
    id: number;
    name: string;
    price: number;
    min_usage: number;
    max_usage: number;
  };
}

const MONTH_OPTIONS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const AddBill = () => {
  const router = useRouter();

  const [isShowing, setIsShowing] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [measurement, setMeasurement] = useState("");
  const [usage, setUsage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const resetForm = () => {
    setCustomerId("");
    setMonth("");
    setYear(new Date().getFullYear());
    setMeasurement("");
    setUsage(0);
  };

  useEffect(() => {
    if (!isShowing) return;
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      const token = Cookies.get("adminToken") || Cookies.get("accessToken");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers?page=1&quantity=999`,
          {
            headers: {
              "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await res.json();
        if (result.success) setCustomers(result.data ?? []);
        else toast.error("Gagal memuat data pelanggan");
      } catch (e) {
        console.error(e);
        toast.error("Gagal memuat data pelanggan");
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, [isShowing]);

  // Hitung estimasi dari customer yang dipilih
  const selectedCustomer = customers.find(c => String(c.id) === customerId);
  const estimatedTotal = selectedCustomer?.service?.price
    ? selectedCustomer.service.price * usage
    : 0;

  // Submit handler — pakai onClick bukan form submit
  const handleSave = async () => {
    if (!customerId) { toast.warning("Pilih pelanggan terlebih dahulu"); return; }
    if (!month) { toast.warning("Pilih bulan terlebih dahulu"); return; }
    if (!measurement.trim()) { toast.warning("Isi nomor meteran terlebih dahulu"); return; }
    if (usage <= 0) { toast.warning("Pemakaian harus lebih dari 0"); return; }

    if (!selectedCustomer) {
      toast.warning("Customer tidak valid");
      return;
    }

    setIsLoading(true);
    const token = Cookies.get("adminToken") || Cookies.get("accessToken");

    const payload = {
      customer_id: Number(customerId),
      service_id: selectedCustomer.service_id,
      month: Number(month),
      year: Number(year),
      measurement_number: measurement.trim(),
      usage_value: Number(usage),
    };

    console.log("Sending payload:", payload); // Debug log

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/bills`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log("Response:", result); // Debug log

      if (result.success || response.ok) {
        toast.success(result.message || "Tagihan berhasil dibuat!");
        setIsShowing(false);
        resetForm();
        router.refresh();
      } else {
        toast.warning(result.message || "Gagal membuat tagihan");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !!customerId && !!month && measurement.trim().length > 0 && usage > 0;

  return (
    <Dialog
      open={isShowing}
      onOpenChange={(v) => {
        setIsShowing(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>Tambah Tagihan</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Tagihan</DialogTitle>
          <DialogDescription>Buat tagihan baru untuk pelanggan</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Customer */}
          <div className="space-y-1.5">
            <Label>Pelanggan *</Label>
            <Select value={customerId} onValueChange={setCustomerId} disabled={loadingCustomers}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingCustomers ? "Memuat pelanggan..." : "Pilih pelanggan"} />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name} ({c.customer_number})
                  </SelectItem>
                ))}
                {customers.length === 0 && !loadingCustomers && (
                  <div className="py-2 px-3 text-sm text-gray-400">Tidak ada pelanggan</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Bulan & Tahun */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Bulan *</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Tahun *</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2100}
              />
            </div>
          </div>

          {/* Nomor Meteran & Pemakaian */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nomor Meteran *</Label>
              <Input
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                placeholder="Contoh: 30041"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Pemakaian (m³) *</Label>
              <Input
                type="number"
                value={usage || ""}
                onChange={(e) => setUsage(Number(e.target.value))}
                min={1}
                placeholder="0"
              />
            </div>
          </div>

          {/* Info service yang terpilih */}
          {selectedCustomer && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-500">Harga Dasar (Rp/m³)</Label>
                <Input
                  value={selectedCustomer.service?.price?.toLocaleString("id-ID") ?? "-"}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-500">Service ID</Label>
                <Input
                  value={selectedCustomer.service_id}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          )}

          {/* Estimasi total */}
          {estimatedTotal > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-sm font-medium text-blue-700">Estimasi Total Tagihan</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(estimatedTotal)}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Batal
            </Button>
          </DialogClose>
          {/* Pakai type="button" dan onClick, BUKAN type="submit" */}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !isFormValid || loadingCustomers}
          >
            {isLoading ? "Menyimpan..." : "Simpan Tagihan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBill;