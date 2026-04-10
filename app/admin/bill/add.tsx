"use client";

import { FormEvent, useState } from "react";
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

const AddBill = () => {
  const router = useRouter();

  const [isShowing, setIsShowing] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState<number>(2025);
  const [measurement, setMeasurement] = useState<number>(0);
  const [usage, setUsage] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCustomerId("");
    setMonth("");
    setYear(2025);
    setMeasurement(0);
    setUsage(0);
    setPrice(0);
  };

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
            customer_id: customerId,
            month,
            year,
            measurement_number: measurement,
            usage_value: usage,
            price,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Bill added");
        setIsShowing(false);
        resetForm();
        router.refresh();
      } else {
        toast.warning(result.message || "Failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isShowing} onOpenChange={setIsShowing}>
      <DialogTrigger asChild>
        <Button>Add Bill</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Bill</DialogTitle>
            <DialogDescription>
              Create new customer bill
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4 py-4">
            <Field>
              <Label>Customer ID</Label>
              <Input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label>Month</Label>
                <Input value={month} onChange={(e)=>setMonth(e.target.value)} required/>
              </Field>

              <Field>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e)=>setYear(Number(e.target.value))}
                />
              </Field>
            </div>

            <Field>
              <Label>Measurement Number</Label>
              <Input
                type="number"
                value={measurement}
                onChange={(e)=>setMeasurement(Number(e.target.value))}
              />
            </Field>

            <Field>
              <Label>Usage (m³)</Label>
              <Input
                type="number"
                value={usage}
                onChange={(e)=>setUsage(Number(e.target.value))}
              />
            </Field>

            <Field>
              <Label>Price</Label>
              <Input
                type="number"
                value={price}
                onChange={(e)=>setPrice(Number(e.target.value))}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBill;