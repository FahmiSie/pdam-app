"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Phone, MapPin, Key, Activity, Calendar, Clock,
  Pencil, Eye, EyeOff, CheckCircle, AlertCircle, Save, X, Hash,
} from "lucide-react";
import Cookies from "js-cookie";

interface CustomerProfile {
  id: number;
  user_id: number;
  customer_number: string;
  name: string;
  phone: string;
  address: string;
  service_id: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
  service: {
    id: number;
    name: string;
    min_usage: number;
    max_usage: number;
    price: number;
  };
}

function getToken() { return Cookies.get("accessToken"); }

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
}

export default function CustProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/me`,
        {
          headers: {
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      const result = await res.json();
      if (result.success) {
        setProfile(result.data);
        setEditName(result.data.name);
        setEditPhone(result.data.phone);
        setEditAddress(result.data.address);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSaveProfile = async () => {
    if (!editName.trim()) { toast.warning("Nama tidak boleh kosong"); return; }
    setIsSavingProfile(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/${profile?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ name: editName, phone: editPhone, address: editAddress }),
        }
      );
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || "Profil berhasil diperbarui");
        setIsEditing(false);
        fetchProfile();
      } else {
        toast.warning(result.message || "Gagal memperbarui profil");
      }
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setIsSavingProfile(false); }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword.length < 6) { setPasswordError("Password minimal 6 karakter"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Password tidak cocok"); return; }
    setIsSavingPassword(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/${profile?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );
      const result = await res.json();
      if (result.success) {
        setPasswordSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordError(result.message || "Gagal mengubah password");
      }
    } catch { setPasswordError("Terjadi kesalahan"); }
    finally { setIsSavingPassword(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading profil...</div>
      </div>
    );
  }

  const initials = profile?.name?.slice(0, 2).toUpperCase() ?? "CU";

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-500 mt-1">Kelola informasi akun Anda</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <Card className="shadow-lg md:col-span-1 flex flex-col items-center justify-center py-10">
          <div className="h-24 w-24 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
            {initials}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{profile?.name ?? "-"}</h2>
          <p className="text-sm text-gray-500 mt-1">@{profile?.user?.username ?? "-"}</p>
          <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-300">
            {profile?.user?.role ?? "CUSTOMER"}
          </Badge>
          <div className="mt-4 text-center px-4">
            <p className="text-xs text-gray-400">No. Pelanggan</p>
            <p className="text-sm font-mono font-semibold text-gray-700 mt-1">
              {profile?.customer_number ?? "-"}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center px-4">
            Terdaftar sejak {profile ? formatDate(profile.createdAt) : "-"}
          </p>
        </Card>

        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Edit Profile Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Informasi Akun
                </CardTitle>
                {!isEditing ? (
                  <Button variant="outline" size="sm"
                    onClick={() => {
                      setIsEditing(true);
                      setEditName(profile?.name ?? "");
                      setEditPhone(profile?.phone ?? "");
                      setEditAddress(profile?.address ?? "");
                    }}
                    className="h-8 gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="h-8 gap-1.5" disabled={isSavingProfile}>
                      <X className="w-3.5 h-3.5" /> Batal
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} className="h-8 gap-1.5" disabled={isSavingProfile}>
                      <Save className="w-3.5 h-3.5" /> {isSavingProfile ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Nama Lengkap</Label>
                {isEditing ? (
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nama lengkap" />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" /> {profile?.name ?? "-"}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Nomor Telepon</Label>
                {isEditing ? (
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Nomor telepon" />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {profile?.phone ?? "-"}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Alamat</Label>
                {isEditing ? (
                  <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Alamat lengkap" />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {profile?.address ?? "-"}
                  </p>
                )}
              </div>

              {/* Customer Number (read only) */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">No. Pelanggan</p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono">{profile?.customer_number ?? "-"}</span>
                </p>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status</p>
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-green-500" />
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Aktif</Badge>
                </div>
              </div>

              {/* Service */}
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Paket Layanan</p>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-blue-800">{profile?.service?.name ?? "-"}</p>
                    <p className="text-xs text-blue-600">
                      {profile?.service?.min_usage}-{profile?.service?.max_usage} m³ —{" "}
                      {profile?.service ? formatCurrency(profile.service.price) : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Joined */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Terdaftar</p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> {profile ? formatDate(profile.createdAt) : "-"}
                </p>
              </div>

              {/* Last Updated */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Terakhir Diperbarui</p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> {profile ? formatDateTime(profile.updatedAt) : "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-orange-500" />
                Ganti Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-sm text-green-700">Password berhasil diubah!</span>
                </div>
              )}
              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-sm text-red-700">{passwordError}</span>
                </div>
              )}
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Password Baru</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" required minLength={6} />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {newPassword && (
                      <p className="text-xs">
                        {newPassword.length >= 6 ? <span className="text-green-600">✓ Password valid</span> : <span className="text-red-600">Minimal 6 karakter</span>}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Konfirmasi Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" required />
                    {confirmPassword && (
                      <p className="text-xs">
                        {newPassword === confirmPassword ? <span className="text-green-600">✓ Password cocok</span> : <span className="text-red-600">Password tidak cocok</span>}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSavingPassword || newPassword.length < 6 || newPassword !== confirmPassword} className="gap-2">
                    <Key className="w-4 h-4" />
                    {isSavingPassword ? "Menyimpan..." : "Simpan Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}