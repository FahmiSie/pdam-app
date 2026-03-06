"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Shield, Calendar, Clock, Key, Activity, Phone,
  Pencil, Eye, EyeOff, CheckCircle, AlertCircle, Save, X,
} from "lucide-react";

// ✅ Sesuai struktur response /admins/me
interface AdminUser {
  id: number;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminProfile {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  user: AdminUser;
}

function getToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("accessToken="))
    ?.split("=")[1];
}

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

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editUsername, setEditUsername] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/admins/me`,
        {
          headers: {
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      const result = await response.json();
      if (response.ok) {
        setProfile(result.data);
        setEditName(result.data.name);
        setEditPhone(result.data.phone);
        setEditUsername(result.data.user?.username ?? "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSaveProfile = async () => {
    if (!editName.trim()) { toast.warning("Name tidak boleh kosong"); return; }
    setIsSavingProfile(true);
    try {
      const body: Record<string, string> = {
        name: editName,
        phone: editPhone,
      };
      // ✅ Hanya kirim username kalau berubah
      if (editUsername !== profile?.user?.username) {
        body.username = editUsername;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/admins/${profile?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY ?? "",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(body),
        }
      );
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Profile updated successfully");
        setIsEditing(false);
        fetchProfile();
      } else {
        toast.warning(result.message || "Failed to update profile");
      }
    } catch { toast.error("An unexpected error occurred"); }
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/admins/${profile?.id}`,
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
      const result = await response.json();
      if (result.success) {
        setPasswordSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordError(result.message || "Gagal mengubah password");
      }
    } catch { setPasswordError("Terjadi kesalahan. Silakan coba lagi."); }
    finally { setIsSavingPassword(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  // ✅ Initials dari name, bukan username
  const initials = profile?.name?.slice(0, 2).toUpperCase() ?? "AD";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <Card className="shadow-lg md:col-span-1 flex flex-col items-center justify-center py-10">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
            {initials}
          </div>
          {/* ✅ Tampilkan name */}
          <h2 className="text-xl font-bold text-gray-900">{profile?.name ?? "-"}</h2>
          {/* ✅ Username dari nested user */}
          <p className="text-sm text-gray-500 mt-1">@{profile?.user?.username ?? "-"}</p>
          <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-300">
            {profile?.user?.role ?? "ADMIN"}
          </Badge>
          <p className="text-xs text-gray-400 mt-4 text-center px-4">
            Member since {profile ? formatDate(profile.createdAt) : "-"}
          </p>
        </Card>

        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Edit Profile Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Account Information
                </CardTitle>
                {!isEditing ? (
                  <Button variant="outline" size="sm"
                    onClick={() => {
                      setIsEditing(true);
                      setEditName(profile?.name ?? "");
                      setEditPhone(profile?.phone ?? "");
                      setEditUsername(profile?.user?.username ?? "");
                    }}
                    className="h-8 gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"
                      onClick={() => setIsEditing(false)}
                      className="h-8 gap-1.5" disabled={isSavingProfile}
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} className="h-8 gap-1.5" disabled={isSavingProfile}>
                      <Save className="w-3.5 h-3.5" /> {isSavingProfile ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Full Name</Label>
                {isEditing ? (
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" /> {profile?.name ?? "-"}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone</Label>
                {isEditing ? (
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone number" />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {profile?.phone ?? "-"}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Username</Label>
                {isEditing ? (
                  <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="Username" />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" /> {profile?.user?.username ?? "-"}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Role</p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-gray-400" /> {profile?.user?.role ?? "-"}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status</p>
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-green-500" />
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Active</Badge>
                </div>
              </div>

              {/* Joined */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Joined</p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> {profile ? formatDate(profile.createdAt) : "-"}
                </p>
              </div>

              {/* Last Updated */}
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Last Updated</p>
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
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-green-700">Password berhasil diubah!</span>
                </div>
              )}
              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{passwordError}</span>
                </div>
              )}
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password Baru</Label>
                    <div className="relative">
                      <Input id="new-password" type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" required minLength={6} />
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
                    <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" required />
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