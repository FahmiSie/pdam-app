"use client";

import { useState, FormEvent } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";

interface Service {
  id: number;
  name: string;
  min_usage: number;
  max_usage: number;
  price: number;
}

interface Customer {
  id: number;
  name: string;
  customer_number: string;
}

interface Bill {
  id: number;
  customer_id: number;
  admin_id: number;
  service_id: number;
  month: number;
  year: number;
  usage_value: number;
  price: number;
  measurement_number: string;
  paid: boolean;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
  service: Service;
  customer: Customer;
  admin: { id: number; name: string; };
}

const EditBillPage = ({ bill }: { bill: Bill }) => {
  const router = useRouter();

  const [isShowing, setIsShowing] = useState(false);
  const [usage, setUsage] = useState(bill.usage_value);
  const [measurement, setMeasurement] = useState(bill.measurement_number);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = Cookies.get("adminToken") || Cookies.get("accessToken");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/bills/${bill.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usage_value: usage,
            measurement_number: measurement,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Tagihan berhasil diperbarui");
        setIsShowing(false);
        router.refresh();
      } else {
        toast.warning(result.message || "Gagal memperbarui tagihan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isShowing} onOpenChange={setIsShowing}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-4 w-4 mr-1" /> Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Tagihan</DialogTitle>
            <DialogDescription>
              Perbarui informasi tagihan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Nomor Meteran</Label>
              <Input
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                placeholder="Nomor meteran"
              />
            </div>

            <div>
              <Label>Pemakaian (m³)</Label>
              <Input
                type="number"
                value={usage}
                onChange={(e) => setUsage(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>

            <Button disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBillPage;