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
import { Pencil } from "lucide-react";
import type { Services } from "@/app/types/services";

interface EditServicesProps {
  service: Services;
}

const EditServices = ({ service }: EditServicesProps) => {
  const router = useRouter();

  const [isShowing, setIsShowing] = useState<boolean>(false);
  const [name, setName] = useState<string>(service.name);
  const [minUsage, setMinUsage] = useState<number>(service.min_usage);
  const [maxUsage, setMaxUsage] = useState<number>(service.max_usage);
  const [price, setPrice] = useState<number>(service.price);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = Cookies.get("accessToken");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/services/${service.id}`,
        {
          method: "PUT",
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
        toast.success(result.message || "Service updated successfully");
        router.refresh();
      } else {
        toast.warning(result.message || "Failed to update service");
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
        <Button variant="outline" size="sm" className="gap-2 hover:bg-blue-50">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the service package details below.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4 py-4">
            <Field>
              <Label htmlFor="edit-name">Service Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Basic Package"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="edit-minUsage">Min Usage (m³)</Label>
                <Input
                  id="edit-minUsage"
                  type="number"
                  value={minUsage}
                  onChange={(e) => setMinUsage(Number(e.target.value))}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="edit-maxUsage">Max Usage (m³)</Label>
                <Input
                  id="edit-maxUsage"
                  type="number"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(Number(e.target.value))}
                  required
                />
              </Field>
            </div>

            <Field>
              <Label htmlFor="edit-price">Price (IDR)</Label>
              <Input
                id="edit-price"
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
              {isLoading ? "Updating..." : "Update Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditServices;