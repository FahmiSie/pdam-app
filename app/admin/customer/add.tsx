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
import type { Services } from "@/app/types/services";

const AddCustomer = () => {
  const router = useRouter();

  const [isShowing, setIsShowing] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [customerNumber, setCustomerNumber] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [services, setServices] = useState<Services[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetForm = () => {
    setName("");
    setCustomerNumber("");
    setPhone("");
    setAddress("");
    setUsername("");
    setPassword("");
    setServiceId("");
  };

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
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/customer`,
        {
          method: "POST",
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
            username,
            password,
            service_id: parseInt(serviceId),
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setIsShowing(false);
        resetForm();
        toast.success(result.message || "Customer added successfully");
        router.refresh();
      } else {
        toast.warning(result.message || "Failed to add customer");
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
        <Button onClick={resetForm}>Add New Customer</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Fill in the customer details below to register a new account.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="customerNumber">Customer Number *</Label>
                <Input
                  id="customerNumber"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  placeholder="e.g. 34545898012332"
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 081234567890"
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="serviceId">Service Package *</Label>
                <Select value={serviceId} onValueChange={setServiceId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} ({service.min_usage}-{service.max_usage} m³)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Jl. Merdeka No. 123, Jakarta"
                required
              />
            </Field>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Account Credentials</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. johndoe"
                    required
                  />
                </Field>
                <Field>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </Field>
              </div>
            </div>
          </FieldGroup>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomer;