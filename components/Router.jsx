"use client";

import { useApp } from "@/components/AppProvider";
import Landing from "@/components/Landing";
import Login from "@/components/Login";
import BranchAdmin from "@/components/branch/BranchAdmin";
import ScannerApp from "@/components/scanner/ScannerApp";
import AdminAppPanel from "@/components/admin/AdminAppPanel";

export default function Router() {
  const { screen } = useApp();

  switch (screen) {
    case "landing":
      return <Landing />;
    case "login":
      return <Login />;
    case "branch":
      return <BranchAdmin />;
    case "scanner":
      return <ScannerApp />;
    case "admin-app":
      return <AdminAppPanel />;
    default:
      return <Landing />;
  }
}
