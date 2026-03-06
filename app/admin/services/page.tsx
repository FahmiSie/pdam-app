import { cookies } from "next/headers";
import type { Services } from "@/types/services";
import AddServices from "./add";
import EditServices from "./edit";
import DeleteServices from "./delete";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, DollarSign, Activity } from "lucide-react";
import Search from "@/components/Search";
import SimplePagination from "@/components/Pagination";

type ResultData = {
  success: boolean;
  message: string;
  data: Services[];
  count: number;
};

type Props = {
  searchParams: Promise<{
    page?: number;
    quantity?: number;
    search?: string;
  }>;
};

async function getService(page: number, quantity: number, search: string): Promise<ResultData> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/services?page=${page}&quantity=${quantity}&search=${search}`,
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
    if (!response.ok) return { success: false, message: "Failed", data: [], count: 0 };
    return result;
  } catch (error) {
    console.error("Fetch services error:", error);
    return { success: false, message: "Error", data: [], count: 0 };
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

export default async function ServicePage({ searchParams }: Props) {
  const page = (await searchParams)?.page || 1;
  const quantity = (await searchParams)?.quantity || 10;
  const search = (await searchParams)?.search || "";

  const { data: services, count } = await getService(page, quantity, search);

  // ✅ Stats pakai count untuk total, data halaman ini untuk rata-rata/kapasitas
  const averagePrice = services.reduce((sum, s) => sum + s.price, 0) / (services.length || 1);
  const totalCapacity = services.reduce((sum, s) => sum + s.max_usage, 0);
  const activeServices = services.filter((s) => s.max_usage > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
            <p className="text-gray-500 mt-1">Manage your PDAM service packages</p>
          </div>
          <AddServices />
        </div>
      </div>

      {/* Stats Cards — ✅ Total Services pakai count */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Services</CardTitle>
            <Package className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            {/* ✅ count = total semua halaman */}
            <div className="text-3xl font-bold">{count}</div>
            <p className="text-xs text-blue-100 mt-1">Service packages</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Average Price</CardTitle>
            <DollarSign className="h-5 w-5 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averagePrice)}</div>
            <p className="text-xs text-green-100 mt-1">Per service</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Capacity</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(totalCapacity)}</div>
            <p className="text-xs text-purple-100 mt-1">m³ max usage</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Active Services</CardTitle>
            <Activity className="h-5 w-5 text-orange-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeServices}</div>
            <p className="text-xs text-orange-100 mt-1">Available now</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Service Packages</CardTitle>
              <CardDescription>
                Complete list of all water service packages
                {search && (
                  <span className="ml-2 text-blue-600 font-medium">
                    — showing results for &quot;{search}&quot; ({count} found)
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <Search
                search={search}
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white hover:border-gray-300 shadow-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {search ? `No services found for "${search}"` : "No services found"}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {search ? "Try a different search term or clear the search." : "Get started by creating a new service package."}
              </p>
              {!search && <div className="mt-6"><AddServices /></div>}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">No</TableHead>
                    <TableHead className="font-semibold">Service Name</TableHead>
                    <TableHead className="font-semibold text-center">Min Usage (m³)</TableHead>
                    <TableHead className="font-semibold text-center">Max Usage (m³)</TableHead>
                    <TableHead className="font-semibold text-right">Price</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service, index) => (
                    <TableRow key={service.id} className="hover:bg-gray-50 transition-colors">
                      {/* ✅ Nomor urut per halaman */}
                      <TableCell className="font-medium">
                        {(Number(page) - 1) * Number(quantity) + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {service.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{service.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-gray-700">{formatNumber(service.min_usage)}</TableCell>
                      <TableCell className="text-center text-gray-700">{formatNumber(service.max_usage)}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{formatCurrency(service.price)}</TableCell>
                      <TableCell className="text-center">
                        {service.max_usage > 0 ? (
                          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-300">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <EditServices service={service} />
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
      {count > 0 && (
        <>
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Services</p>
                  {/* ✅ Pakai count */}
                  <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Average Price</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(averagePrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Max Capacity</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{formatNumber(totalCapacity)} m³</p>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="mt-6 flex justify-center">
            <SimplePagination count={count} perPage={quantity} currentPage={page} />
          </div>
        </>
      )}
    </div>
  );
}