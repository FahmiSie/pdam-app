// "use client";

// import {
//   BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
//   XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
// } from "recharts";
// import {
//   CheckCircle, Clock, AlertCircle, TrendingUp,
// } from "lucide-react";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface Service {
//   id: number;
//   name: string;
//   price: number;
//   min_usage: number;
//   max_usage: number;
// }

// interface Bill {
//   id: number;
//   customer_id: number;
//   month: number;
//   year: number;
//   usage_value: number;
//   price: number;
//   paid: boolean;
//   measurement_number: string;
//   customer: { id: number; name: string; customer_number: string };
//   service: Service;
//   admin: { id: number; name: string };
// }

// interface Payment {
//   id: number;
//   bill_id: number;
//   verified: boolean;
//   proof_image?: string;
//   createdAt: string;
// }

// interface Props {
//   bills: Bill[];
//   payments: Payment[];
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const MONTH_SHORT = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
// const MONTH_FULL  = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// function fmt(n: number) {
//   return new Intl.NumberFormat("id-ID", {
//     style: "currency", currency: "IDR", minimumFractionDigits: 0,
//   }).format(n);
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────
// function Section({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
//       <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
//         {title}
//       </h2>
//       {children}
//     </div>
//   );
// }

// function Empty({ text = "Belum ada data" }: { text?: string }) {
//   return <p className="text-white/30 text-sm text-center py-8">{text}</p>;
// }

// function DarkTooltip({ active, payload, label }: any) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="bg-[#1a1f2e] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
//       {label && <p className="text-white/50 mb-1">{label}</p>}
//       {payload.map((p: any, i: number) => (
//         <p key={i} style={{ color: p.color }} className="font-semibold">
//           {p.name}:{" "}
//           {typeof p.value === "number" && p.value > 10000
//             ? fmt(p.value)
//             : p.value}
//         </p>
//       ))}
//     </div>
//   );
// }

// // ─── Main Export ──────────────────────────────────────────────────────────────
// export function DashboardCharts({ bills, payments }: Props) {
//   // ── Derived data ────────────────────────────────────────────────────────────
//   const verifiedPayments = payments.filter(p => p.verified);
//   const pendingPayments  = payments.filter(p => !p.verified);
//   const paidBillIds      = new Set(verifiedPayments.map(p => p.bill_id));
//   const pendingBillIds   = new Set(pendingPayments.map(p => p.bill_id));

//   const paidBills    = bills.filter(b => paidBillIds.has(b.id));
//   const pendingBills = bills.filter(b => pendingBillIds.has(b.id));
//   const unpaidBills  = bills.filter(b => !paidBillIds.has(b.id) && !pendingBillIds.has(b.id));

//   // 1. Donut
//   const statusData = [
//     { name: "Verified",    value: paidBills.length,    color: "#22c55e" },
//     { name: "Pending",     value: pendingBills.length,  color: "#eab308" },
//     { name: "Belum Bayar", value: unpaidBills.length,   color: "#ef4444" },
//   ];

//   // 2. Monthly revenue line
//   const revenueByMonth: Record<string, number> = {};
//   paidBills.forEach(b => {
//     const key = `${b.year}-${String(b.month).padStart(2, "0")}`;
//     revenueByMonth[key] = (revenueByMonth[key] ?? 0) + b.price;
//   });
//   const revenueChartData = Object.entries(revenueByMonth)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .slice(-6)
//     .map(([key, val]) => {
//       const [yr, mo] = key.split("-");
//       return { month: `${MONTH_SHORT[+mo]} ${yr}`, revenue: val };
//     });

//   // 3. Bills vs Paid bar
//   const billsByMonth: Record<string, { total: number; paid: number }> = {};
//   bills.forEach(b => {
//     const key = `${b.year}-${String(b.month).padStart(2, "0")}`;
//     if (!billsByMonth[key]) billsByMonth[key] = { total: 0, paid: 0 };
//     billsByMonth[key].total++;
//     if (paidBillIds.has(b.id)) billsByMonth[key].paid++;
//   });
//   const billsVsPaidData = Object.entries(billsByMonth)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .slice(-6)
//     .map(([key, val]) => {
//       const [yr, mo] = key.split("-");
//       return { month: `${MONTH_SHORT[+mo]} ${yr}`, ...val };
//     });

//   // 4. Top paying customers
//   const customerPayMap: Record<number, { name: string; count: number; total: number }> = {};
//   paidBills.forEach(b => {
//     if (!b.customer) return;
//     if (!customerPayMap[b.customer_id])
//       customerPayMap[b.customer_id] = { name: b.customer.name, count: 0, total: 0 };
//     customerPayMap[b.customer_id].count++;
//     customerPayMap[b.customer_id].total += b.price;
//   });
//   const topCustomers = Object.values(customerPayMap)
//     .sort((a, b) => b.total - a.total)
//     .slice(0, 5);

//   // 5. Unpaid customers
//   const unpaidMap: Record<number, { name: string; count: number; total: number }> = {};
//   unpaidBills.forEach(b => {
//     if (!b.customer) return;
//     if (!unpaidMap[b.customer_id])
//       unpaidMap[b.customer_id] = { name: b.customer.name, count: 0, total: 0 };
//     unpaidMap[b.customer_id].count++;
//     unpaidMap[b.customer_id].total += b.price;
//   });
//   const unpaidCustomers = Object.values(unpaidMap)
//     .sort((a, b) => b.total - a.total)
//     .slice(0, 5);

//   // 6. Usage per customer (top 8, horizontal bar)
//   const usageMap: Record<number, { name: string; usage: number }> = {};
//   bills.forEach(b => {
//     if (!b.customer) return;
//     if (!usageMap[b.customer_id])
//       usageMap[b.customer_id] = { name: b.customer.name, usage: 0 };
//     usageMap[b.customer_id].usage += b.usage_value;
//   });
//   const usageData = Object.values(usageMap)
//     .sort((a, b) => b.usage - a.usage)
//     .slice(0, 8)
//     .map(d => ({ name: d.name.split(" ")[0], usage: d.usage }));

//   // 7. Admin performance
//   const adminMap: Record<number, { name: string; count: number }> = {};
//   paidBills.forEach(b => {
//     if (!b.admin) return;
//     if (!adminMap[b.admin.id])
//       adminMap[b.admin.id] = { name: b.admin.name, count: 0 };
//     adminMap[b.admin.id].count++;
//   });
//   const adminData = Object.values(adminMap).sort((a, b) => b.count - a.count);

//   // 8. Recent payments (last 8)
//   const recentPayments = [...payments]
//     .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
//     .slice(0, 8);

//   const rankColor = ["text-yellow-400", "text-gray-300", "text-amber-600"];

//   return (
//     <div className="space-y-4 mt-6">

//       {/* ── Row 1: Donut + Revenue ─────────────────────────────────────────── */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//         <Section title="Status Pembayaran">
//           <div className="flex items-center gap-4">
//             <ResponsiveContainer width="50%" height={170}>
//               <PieChart>
//                 <Pie
//                   data={statusData}
//                   innerRadius={48}
//                   outerRadius={75}
//                   dataKey="value"
//                   paddingAngle={3}
//                 >
//                   {statusData.map((d, i) => (
//                     <Cell key={i} fill={d.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<DarkTooltip />} />
//               </PieChart>
//             </ResponsiveContainer>

//             <div className="flex-1 space-y-3">
//               {statusData.map(d => (
//                 <div key={d.name} className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
//                     <span className="text-sm text-white/70">{d.name}</span>
//                   </div>
//                   <span className="text-sm font-bold">{d.value}</span>
//                 </div>
//               ))}
//               <div className="pt-2 border-t border-white/10 flex justify-between">
//                 <span className="text-xs text-white/40">Total</span>
//                 <span className="text-sm font-bold">{bills.length}</span>
//               </div>
//             </div>
//           </div>
//         </Section>

//         <Section title="Tren Pendapatan Bulanan (Verified)">
//           {revenueChartData.length === 0 ? (
//             <Empty text="Belum ada pendapatan verified" />
//           ) : (
//             <ResponsiveContainer width="100%" height={170}>
//               <LineChart data={revenueChartData}>
//                 <XAxis
//                   dataKey="month"
//                   tick={{ fill: "#ffffff40", fontSize: 11 }}
//                   axisLine={false} tickLine={false}
//                 />
//                 <YAxis
//                   tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
//                   tick={{ fill: "#ffffff40", fontSize: 10 }}
//                   axisLine={false} tickLine={false}
//                   width={36}
//                 />
//                 <Tooltip content={<DarkTooltip />} />
//                 <Line
//                   type="monotone"
//                   dataKey="revenue"
//                   name="Pendapatan"
//                   stroke="#22c55e"
//                   strokeWidth={2.5}
//                   dot={{ fill: "#22c55e", r: 4 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           )}
//         </Section>
//       </div>

//       {/* ── Row 2: Bills vs Paid + Usage ──────────────────────────────────── */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//         <Section title="Total Tagihan vs Terbayar per Bulan">
//           {billsVsPaidData.length === 0 ? (
//             <Empty />
//           ) : (
//             <ResponsiveContainer width="100%" height={170}>
//               <BarChart data={billsVsPaidData} barCategoryGap="30%">
//                 <XAxis
//                   dataKey="month"
//                   tick={{ fill: "#ffffff40", fontSize: 11 }}
//                   axisLine={false} tickLine={false}
//                 />
//                 <YAxis
//                   tick={{ fill: "#ffffff40", fontSize: 10 }}
//                   axisLine={false} tickLine={false}
//                   width={24}
//                 />
//                 <Tooltip content={<DarkTooltip />} />
//                 <Legend wrapperStyle={{ fontSize: 11, color: "#ffffff60" }} />
//                 <Bar dataKey="total" name="Total Tagihan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
//                 <Bar dataKey="paid"  name="Terbayar"      fill="#22c55e" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </Section>

//         <Section title="Pemakaian Air per Pelanggan (m³)">
//           {usageData.length === 0 ? (
//             <Empty />
//           ) : (
//             <ResponsiveContainer width="100%" height={170}>
//               <BarChart data={usageData} layout="vertical" barCategoryGap="25%">
//                 <XAxis
//                   type="number"
//                   tick={{ fill: "#ffffff40", fontSize: 10 }}
//                   axisLine={false} tickLine={false}
//                 />
//                 <YAxis
//                   type="category"
//                   dataKey="name"
//                   tick={{ fill: "#ffffff60", fontSize: 11 }}
//                   axisLine={false} tickLine={false}
//                   width={64}
//                 />
//                 <Tooltip content={<DarkTooltip />} />
//                 <Bar dataKey="usage" name="Pemakaian (m³)" fill="#6366f1" radius={[0, 4, 4, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </Section>
//       </div>

//       {/* ── Row 3: Top customers + Unpaid + Admin ─────────────────────────── */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

//         <Section title="Top Pelanggan Taat Bayar">
//           {topCustomers.length === 0 ? (
//             <Empty />
//           ) : (
//             <div className="space-y-3">
//               {topCustomers.map((c, i) => (
//                 <div key={i} className="flex items-center gap-3">
//                   <span className={`text-xs font-bold w-5 text-center ${rankColor[i] ?? "text-white/30"}`}>
//                     #{i + 1}
//                   </span>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium truncate">{c.name}</p>
//                     <p className="text-xs text-white/40">{c.count} tagihan lunas</p>
//                   </div>
//                   <span className="text-xs font-semibold text-green-400 shrink-0">
//                     {fmt(c.total)}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </Section>

//         <Section title="Pelanggan Menunggak">
//           {unpaidCustomers.length === 0 ? (
//             <p className="text-white/30 text-sm text-center py-4">
//               Semua tagihan sudah dibayar 🎉
//             </p>
//           ) : (
//             <div className="space-y-3">
//               {unpaidCustomers.map((c, i) => (
//                 <div key={i} className="flex items-center gap-3">
//                   <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium truncate">{c.name}</p>
//                     <p className="text-xs text-white/40">{c.count} tagihan belum bayar</p>
//                   </div>
//                   <span className="text-xs font-semibold text-red-400 shrink-0">
//                     {fmt(c.total)}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </Section>

//         <Section title="Performa Admin (Verifikasi)">
//           {adminData.length === 0 ? (
//             <Empty text="Belum ada verifikasi" />
//           ) : (
//             <div className="space-y-3">
//               {adminData.map((a, i) => {
//                 const pct = adminData[0].count > 0
//                   ? (a.count / adminData[0].count) * 100
//                   : 0;
//                 return (
//                   <div key={i}>
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-white/70 truncate max-w-[70%]">{a.name}</span>
//                       <span className="font-semibold text-purple-300">{a.count}x</span>
//                     </div>
//                     <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-purple-500 rounded-full"
//                         style={{ width: `${pct}%` }}
//                       />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </Section>
//       </div>

//       {/* ── Row 4: Recent Payments Table ──────────────────────────────────── */}
//       <Section title="Pembayaran Terbaru">
//         {recentPayments.length === 0 ? (
//           <Empty text="Belum ada pembayaran" />
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
//                   <th className="text-left pb-2 pr-4 font-medium">Pelanggan</th>
//                   <th className="text-left pb-2 pr-4 font-medium">Tagihan</th>
//                   <th className="text-right pb-2 pr-4 font-medium">Nominal</th>
//                   <th className="text-center pb-2 pr-4 font-medium">Bukti</th>
//                   <th className="text-center pb-2 font-medium">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-white/5">
//                 {recentPayments.map(p => {
//                   const bill = bills.find(b => b.id === p.bill_id);
//                   return (
//                     <tr key={p.id} className="hover:bg-white/5 transition-colors">
//                       <td className="py-2.5 pr-4">
//                         <p className="font-medium">{bill?.customer?.name ?? `Bill #${p.bill_id}`}</p>
//                         <p className="text-xs text-white/40">{bill?.customer?.customer_number}</p>
//                       </td>
//                       <td className="py-2.5 pr-4 text-white/60 text-sm">
//                         {bill ? `${MONTH_FULL[bill.month]} ${bill.year}` : "—"}
//                       </td>
//                       <td className="py-2.5 pr-4 text-right font-semibold text-green-400">
//                         {bill ? fmt(bill.price) : "—"}
//                       </td>
//                       <td className="py-2.5 pr-4 text-center">
//                         {p.proof_image ? (
//                           <a
//                             href={`${process.env.NEXT_PUBLIC_BASE_API_URL}/payment-proof/${p.proof_image}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-xs text-blue-400 hover:text-blue-300 underline"
//                           >
//                             Lihat
//                           </a>
//                         ) : (
//                           <span className="text-white/20 text-xs">—</span>
//                         )}
//                       </td>
//                       <td className="py-2.5 text-center">
//                         {p.verified ? (
//                           <span className="inline-flex items-center gap-1 text-xs bg-green-500/15 text-green-400 border border-green-500/30 rounded-full px-2.5 py-0.5">
//                             <CheckCircle className="w-3 h-3" /> Verified
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 rounded-full px-2.5 py-0.5">
//                             <Clock className="w-3 h-3" /> Pending
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </Section>
//     </div>
//   );
// }