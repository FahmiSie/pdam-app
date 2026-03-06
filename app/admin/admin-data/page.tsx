"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, UserPlus, Trash2, Users, Search as SearchIcon } from "lucide-react";
import SimplePagination from "@/components/Pagination";

interface AdminUser {
  id: number;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Admin {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  user: AdminUser;
}

interface ResultData {
  success: boolean;
  message: string;
  data: Admin[];
  count: number;
}

function getToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("accessToken="))
    ?.split("=")[1];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Add Admin Modal ──────────────────────────────────────────────────────────
function AddAdmin({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => { setName(""); setPhone(""); setUsername(""); setPassword(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/admins`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ name, phone, username, password }),
        }
      );
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Admin added successfully");
        setOpen(false);
        reset();
        onSuccess();
      } else {
        toast.warning(result.message || "Failed to add admin");
      }
    } catch { toast.error("An unexpected error occurred"); }
    finally { setIsLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button><UserPlus className="w-4 h-4 mr-2" /> Add Admin</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>Create a new administrator account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Full Name *</Label>
                <Input id="add-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone *</Label>
                <Input id="add-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 08123456789" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-username">Username *</Label>
                <Input id="add-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. admin01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-password">Password *</Label>
                <Input id="add-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" required minLength={6} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Admin Modal ───────────────────────────────────────────────────────
function DeleteAdmin({ admin, onSuccess }: { admin: Admin; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/admins/${admin.id}`,
        {
          method: "DELETE",
          headers: {
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Admin deleted");
        setOpen(false);
        onSuccess();
      } else {
        toast.warning(result.message || "Failed to delete admin");
      }
    } catch { toast.error("An unexpected error occurred"); }
    finally { setIsLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Admin</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold">{admin.name}</span> (<span className="font-mono text-xs">{admin.user?.username}</span>)? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDataPage() {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const quantity = Number(searchParams.get("quantity")) || 10;

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  // ✅ searchInput sebagai sumber kebenaran, bukan URL
  const [searchInput, setSearchInput] = useState("");

  // ✅ fetchAdmins menerima parameter search langsung
  const fetchAdmins = useCallback(async (searchValue: string = "") => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/admins?page=${page}&quantity=${quantity}&search=${searchValue}`,
        {
          headers: {
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
          cache: "no-store",
        }
      );
      const result: ResultData = await response.json();
      if (result.success) {
        setAdmins(result.data);
        setCount(result.count);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
    }
  }, [page, quantity]);

  // ✅ Fetch saat halaman pertama load atau page/quantity berubah
  useEffect(() => {
    fetchAdmins(searchInput);
  }, [page, quantity]);

  // ✅ Debounce search — langsung fetch dengan nilai terbaru
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAdmins(searchInput);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Data</h1>
            <p className="text-gray-500 mt-1">Manage administrator accounts</p>
          </div>
          <AddAdmin onSuccess={() => fetchAdmins(searchInput)} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Admins</CardTitle>
            <Users className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{count}</div>
            <p className="text-xs text-blue-100 mt-1">Registered admins</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">Active Admins</CardTitle>
            <Shield className="h-5 w-5 text-indigo-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{admins.length}</div>
            <p className="text-xs text-indigo-100 mt-1">On this page</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Administrator List</CardTitle>
              <CardDescription>
                All registered admin accounts
                {searchInput && (
                  <span className="ml-2 text-blue-600 font-medium">
                    — results for &quot;{searchInput}&quot; ({count} found)
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search admins..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white hover:border-gray-300 shadow-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : admins.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {searchInput ? `No admins found for "${searchInput}"` : "No admins found"}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchInput ? "Try a different search term." : "Get started by adding a new admin."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">No</TableHead>
                      <TableHead className="font-semibold">Admin</TableHead>
                      <TableHead className="font-semibold">Username</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold text-center">Role</TableHead>
                      <TableHead className="font-semibold text-center">Joined</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin, index) => (
                      <TableRow key={admin.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium">
                          {(page - 1) * quantity + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                              {admin.name?.slice(0, 2).toUpperCase() ?? "AD"}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{admin.name ?? "-"}</div>
                              <div className="text-xs text-gray-400">ID: {admin.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {admin.user?.username ?? "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {admin.phone ?? "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            {admin.user?.role ?? "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                          {formatDate(admin.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <DeleteAdmin admin={admin} onSuccess={() => fetchAdmins(searchInput)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {count > 0 && (
                <div className="mt-4 flex justify-center">
                  <SimplePagination count={count} perPage={quantity} currentPage={page} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}