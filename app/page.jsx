"use client";

import { AppProvider } from "@/components/AppProvider";
import Router from "@/components/Router";

export default function Home() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
