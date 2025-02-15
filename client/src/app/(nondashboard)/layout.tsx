"use client";
import NonDashboardNavbar from "@/components/NonDashboardNavbar";
import Footer from "@/components/Footer";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="nondashboard-layout">
      <NonDashboardNavbar />
      <main className="nondashboard-layout__main">{children}</main>
      <Footer />
    </div>
  );
}
