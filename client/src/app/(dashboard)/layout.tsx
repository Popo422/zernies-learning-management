"use client";

import AppSidebar from "@/components/AppSidebar";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [courseId, setCourseId] = useState<string | null>(null);
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <Loading />;
  if (!user) return <div>Please sign in to access this page.</div>;
  return (
    <SidebarProvider>
      <div className="dashboard">
        {/* Sidebar goes here  */}
        <AppSidebar />
        <div className="dashboard__content">
          {/* chapter sidebar will go */}
          <div className={cn("dashboard__main")} style={{ height: "100vh" }}>
            <Navbar isCoursePage={pathname.startsWith("/user/courses")} />
            <main className="dashboard__body">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
