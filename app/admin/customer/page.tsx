import { cookies } from "next/headers";
import type { Customer } from "@/app/types/customer";
import AddCustomer from "./add";
import EditCustomer from "./edit";
import DeleteCustomer from "./delete";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Users, UserCheck, Phone, MapPin } from "lucide-react";

type ResultData = {
  success: boolean;
  message: string;
  data: Customer[];
  count: number;
};

async function getCustomers(): Promise<Customer[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/customer`,
      {
        headers: {
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const result: ResultData = await response.json();
    if (!response.ok) return [];

    return result.data;
  } catch (error) {
    console.error("Fetch customers error:", error);
    return [];
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatPhone(phone: string): string {
  if (phone.length >= 10) {
    return phone.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  }
  return phone;
}

// Calculate stats
function calculateStats(customers: Customer[]) {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (customer) => customer.user.role === "CUSTOMER"
  ).length;
  const totalServices = new Set(customers.map((c) => c.service_id)).size;

  return { totalCustomers, activeCustomers, totalServices };
}

export default async function CustomerPage() {
  const customers = await getCustomers();
  const stats = calculateStats(customers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your PDAM customer database
            </p>
          </div>
          <AddCustomer />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Customers Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total Customers
            </CardTitle>
            <Users className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-blue-100 mt-1">Registered users</p>
          </CardContent>
        </Card>

        {/* Active Customers Card */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Active Customers
            </CardTitle>
            <UserCheck className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-green-100 mt-1">Active accounts</p>
          </CardContent>
        </Card>

        {/* Total Services Used Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Services Used
            </CardTitle>
            <MapPin className="h-5 w-5 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-purple-100 mt-1">Different packages</p>
          </CardContent>
        </Card>

        {/* Contact Info Card */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">
              Total Contacts
            </CardTitle>
            <Phone className="h-5 w-5 text-orange-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customers.length}</div>
            <p className="text-xs text-orange-100 mt-1">Phone numbers</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Customer Database</CardTitle>
          <CardDescription>
            Complete list of all registered PDAM customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No customers found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by adding a new customer.
              </p>
              <div className="mt-6">
                <AddCustomer />
              </div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">No</TableHead>
                    <TableHead className="font-semibold">
                      Customer Info
                    </TableHead>
                    <TableHead className="font-semibold">
                      Customer Number
                    </TableHead>
                    <TableHead className="font-semibold">Username</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Address</TableHead>
                    <TableHead className="font-semibold">
                      Service Package
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Service Price
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer, index) => (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {customer.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {customer.customer_number}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {customer.user.username}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{formatPhone(customer.phone)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1 text-sm max-w-[200px]">
                          <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {customer.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {customer.service.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {customer.service.min_usage} -{" "}
                            {customer.service.max_usage} m³
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(customer.service.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        {customer.user.role === "CUSTOMER" ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 border-gray-300"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <EditCustomer customer={customer} />
                          <DeleteCustomer customerId={customer.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Footer */}
      {customers.length > 0 && (
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalCustomers}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Active Accounts
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.activeCustomers}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Services in Use
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {stats.totalServices}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}