import { cookies } from "next/headers";
import type { Services } from "@/app/types/services";
import AddServices from "./add";
import DeleteServices from "./delete";
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
import { Package, TrendingUp, DollarSign, Activity } from "lucide-react";

type ResultData = {
  success: boolean;
  message: string;
  data: Services[];
  count: number;
};

async function getService(): Promise<Services[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/services`,
      {
        headers: {
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );

    const result: ResultData = await response.json();
    if (!response.ok) return [];

    return result.data;
  } catch (error) {
    console.error("Fetch services error:", error);
    return [];
  }
}

// Helper function untuk format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Helper function untuk format number
function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

// Calculate stats
function calculateStats(services: Services[]) {
  const totalServices = services.length;
  const averagePrice =
    services.reduce((sum, service) => sum + service.price, 0) / totalServices ||
    0;
  const totalCapacity = services.reduce(
    (sum, service) => sum + service.max_usage,
    0
  );
  const activeServices = services.filter(
    (service) => service.max_usage > 0
  ).length;

  return { totalServices, averagePrice, totalCapacity, activeServices };
}

export default async function ServicePage() {
  const services = await getService();
  const stats = calculateStats(services);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Services Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your PDAM service packages
            </p>
          </div>
          <AddServices/>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Services Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total Services
            </CardTitle>
            <Package className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-blue-100 mt-1">Service packages</p>
          </CardContent>
        </Card>

        {/* Average Price Card */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Average Price
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.averagePrice)}
            </div>
            <p className="text-xs text-green-100 mt-1">Per service</p>
          </CardContent>
        </Card>

        {/* Total Capacity Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Total Capacity
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(stats.totalCapacity)}
            </div>
            <p className="text-xs text-purple-100 mt-1">m³ max usage</p>
          </CardContent>
        </Card>

        {/* Active Services Card */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">
              Active Services
            </CardTitle>
            <Activity className="h-5 w-5 text-orange-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeServices}</div>
            <p className="text-xs text-orange-100 mt-1">Available now</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Service Packages</CardTitle>
          <CardDescription>
            Complete list of all water service packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No services found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by creating a new service package.
              </p>
              <div className="mt-6">
                <AddServices/>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">No</TableHead>
                    <TableHead className="font-semibold">
                      Service Name
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Min Usage (m³)
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Max Usage (m³)
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Price
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
                  {services.map((service, index) => (
                    <TableRow
                      key={service.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {service.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">
                            {service.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-gray-700">
                        {formatNumber(service.min_usage)}
                      </TableCell>
                      <TableCell className="text-center text-gray-700">
                        {formatNumber(service.max_usage)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(service.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        {service.max_usage > 0 ? (
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
                          <AddServices service={service} />
                          <DeleteServices serviceId={service.id} />
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
      {services.length > 0 && (
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Services
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalServices}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Average Price
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(stats.averagePrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Max Capacity
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {formatNumber(stats.totalCapacity)} m³
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}