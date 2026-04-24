// middleware.ts atau lib/proxy.ts
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Baca token per role — pakai nama cookie yang spesifik
  const adminToken    = request.cookies.get("adminToken")?.value;
  const customerToken = request.cookies.get("customerToken")?.value;
  const role          = request.cookies.get("userRole")?.value; // "ADMIN" | "CUSTOMER"

  const isAdminPage  = pathname.startsWith("/admin");
  const isCustPage   = pathname.startsWith("/cust");
  const isAuthPage   = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  // ── Kalau sudah login, jangan bisa akses halaman auth lagi ──────────────
  if (isAuthPage) {
    if (role === "ADMIN" && adminToken) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (role === "CUSTOMER" && customerToken) {
      return NextResponse.redirect(new URL("/cust/dashboard", request.url));
    }
    return NextResponse.next(); // belum login, boleh akses sign-in
  }

  // ── Proteksi halaman admin ───────────────────────────────────────────────
  if (isAdminPage) {
    if (!adminToken) {
      // Tidak punya token admin → ke sign-in
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    if (role !== "ADMIN") {
      // Punya token tapi bukan admin (misal customer nyasar) → ke dashboard customer
      return NextResponse.redirect(new URL("/cust/dashboard", request.url));
    }
  }

  // ── Proteksi halaman customer ────────────────────────────────────────────
  if (isCustPage) {
    if (!customerToken) {
      // Tidak punya token customer → ke sign-in
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    if (role !== "CUSTOMER") {
      // Punya token tapi bukan customer (misal admin nyasar) → ke dashboard admin
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}