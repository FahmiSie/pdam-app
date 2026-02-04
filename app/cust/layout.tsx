import React from "react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md p-4 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Customer Dashboard</h1>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}
