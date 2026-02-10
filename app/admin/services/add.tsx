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
} from "@/app/components/ui/dialog";
import { Field, FieldGroup } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

const AddServices = () => {
  const router = useRouter();

  const [isShowing, setIsShowing] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [minUsage, setMinUsage] = useState<number>(0);
  const [maxUsage, setMaxUsage] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetForm = () => {
    setName("");
    setMinUsage(0);
    setMaxUsage(0);
    setPrice(0);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = Cookies.get("accessToken");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/services`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "APP-KEY": `${process.env.NEXT_PUBLIC_APP_KEY || ""}`,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            min_usage: minUsage,
            max_usage: maxUsage,
            price,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setIsShowing(false);
        resetForm();
        toast.success(result.message || "Service added successfully");
        router.refresh();
      } else {
        toast.warning(result.message || "Failed to add service");
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isShowing} onOpenChange={setIsShowing}>
      <DialogTrigger asChild>
        <Button onClick={resetForm}>Add Data Service</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new service package.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4 py-4">
            <Field>
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Basic Package"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="minUsage">Min Usage (m³)</Label>
                <Input
                  id="minUsage"
                  type="number"
                  value={minUsage}
                  onChange={(e) => setMinUsage(Number(e.target.value))}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="maxUsage">Max Usage (m³)</Label>
                <Input
                  id="maxUsage"
                  type="number"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(Number(e.target.value))}
                  required
                />
              </Field>
            </div>

            <Field>
              <Label htmlFor="price">Price (IDR)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServices;