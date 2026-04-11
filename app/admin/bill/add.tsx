"use client";

import { FormEvent, useState, useEffect } from "react";
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

import { Field, FieldGroup } from "@/components/ui/field";
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

  // Fetch customers for dropdown
  useEffect(() => {
    if (!isShowing) return;
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      const token = Cookies.get("accessToken");
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
        if (result.success) setCustomers(result.data);
      } catch (e) { console.error(e); }
      finally { setLoadingCustomers(false); }
    };
    fetchCustomers();
  }, [isShowing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = Cookies.get("accessToken");

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
          body: JSON.stringify({
            customer_id: Number(customerId),
            month: Number(month),
            year,
            measurement_number: measurement,
            usage_value: usage,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Tagihan berhasil dibuat");
        setIsShowing(false);
        resetForm();
        router.refresh();
      } else {
        toast.warning(result.message || "Gagal membuat tagihan");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isShowing} onOpenChange={(v) => { setIsShowing(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>Tambah Tagihan</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Tagihan</DialogTitle>
            <DialogDescription>
              Buat tagihan baru untuk pelanggan
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4 py-4">
            {/* Customer Dropdown */}
            <Field>
              <Label>Pelanggan *</Label>
              <Select value={customerId} onValueChange={setCustomerId} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingCustomers ? "Memuat..." : "Pilih pelanggan"} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} ({c.customer_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Month & Year */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label>Bulan *</Label>
                <Select value={month} onValueChange={setMonth} required>
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
              </Field>

              <Field>
                <Label>Tahun *</Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={2000}
                  max={2100}
                  required
                />
              </Field>
            </div>

            {/* Measurement Number */}
            <Field>
              <Label>Nomor Meteran *</Label>
              <Input
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                placeholder="Contoh: 30041"
                required
              />
            </Field>

            {/* Usage Value */}
            <Field>
              <Label>Pemakaian (m³) *</Label>
              <Input
                type="number"
                value={usage}
                onChange={(e) => setUsage(Number(e.target.value))}
                min={0}
                placeholder="Masukkan pemakaian"
                required
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>

            <Button type="submit" disabled={isLoading || !customerId || !month}>
              {isLoading ? "Menyimpan..." : "Simpan Tagihan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBill;