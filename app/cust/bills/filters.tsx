"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "all";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      className="px-3 py-2 text-sm border rounded-xl bg-white"
    >
      <option value="all">Semua</option>
      <option value="unpaid">Belum Bayar</option>
      <option value="pending">Pending</option>
      <option value="paid">Lunas</option>
    </select>
  );
}