'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Eye, EyeOff, KeyRound } from 'lucide-react';

interface ResetPasswordProps {
  customerId: number;
  customerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResetPassword({ customerId, customerName, onClose, onSuccess }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validatePassword(newPassword)) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Ambil token dari document.cookie (sudah benar)
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      // ✅ Pakai PATCH /customers/{id} — field password diterima di endpoint update
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/customers/${customerId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'APP-KEY': process.env.NEXT_PUBLIC_APP_KEY || '',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Gagal mengubah password');
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5" />
            <span>Ganti Password Pelanggan</span>
          </CardTitle>
          <CardDescription>
            Ganti password untuk: <strong>{customerName}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center space-y-4 py-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-700">Berhasil!</h3>
                <p className="text-sm text-green-600">Password pelanggan berhasil diubah</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {newPassword && (
                  <p className="text-xs text-slate-500">
                    {validatePassword(newPassword) ? (
                      <span className="text-green-600">✓ Password valid</span>
                    ) : (
                      <span className="text-red-600">Password minimal 6 karakter</span>
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  required
                  minLength={6}
                />
                {confirmPassword && newPassword && (
                  <p className="text-xs text-slate-500">
                    {newPassword === confirmPassword ? (
                      <span className="text-green-600">✓ Password cocok</span>
                    ) : (
                      <span className="text-red-600">Password tidak cocok</span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || !validatePassword(newPassword) || newPassword !== confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Password'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}