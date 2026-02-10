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
} from "@/app/components/ui/dialog";
import { Field, FieldGroup } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Pencil } from "lucide-react";
import type { Customer } from "@/app/types/customer";
import type { Services } from "@/app/types/services";

interface EditCustomerProps {
  customer: Customer;
}

const EditCustomer = ({ customer }: EditCustomerProps) => {
  const router = useRouter();

  const [isShowing, setIsShowing] = useState<boolean>(false);
  const [name, setName] = useState<string>(customer.name);
  const [customerNumber, setCustomerNumber] = useState<string>(
    customer.customer_number
  );
  const [phone, setPhone] = useState<string>(customer.phone);
  const [address, setAddress] = useState<string>(customer.address);
  const [serviceId, setServiceId] = useState<string>(
    customer.service_id.toString()
  );
  const [services, setServices] = useState<Services[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch services for dropdown
  useEffect(() => {
    const fetchServices = async () => {
      const token = Cookies.get("accessToken");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/services`,
          {
            headers: {
              "APP-KEY": `${process.env.NEXT_PUBLIC_APP_KEY || ""}`,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          setServices(result.data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    if (isShowing) {
      fetchServices();
    }
  }, [isShowing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = Cookies.get("accessToken");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/customer/${customer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "APP-KEY": `${process.env.NEXT_PUBLIC_APP_KEY || ""}`,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            customer_number: customerNumber,
            phone,
            address,
            service_id: parseInt(serviceId),
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setIsShowing(false);
        toast.success(result.message || "Customer updated successfully");
        router.refresh();
      } else {
        toast.warning(result.message || "Failed to update customer");
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

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information below.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="edit-customerNumber">Customer Number *</Label>
                <Input
                  id="edit-customerNumber"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="edit-phone">Phone Number *</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="edit-serviceId">Service Package *</Label>
                <Select value={serviceId} onValueChange={setServiceId} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} ({service.min_usage}-{service.max_usage}{" "}
                        m³)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <Label htmlFor="edit-address">Address *</Label>
              <Input
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
              {isLoading ? "Updating..." : "Update Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomer;