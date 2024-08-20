"use client"

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export default function Providers({ children }: {
  children: React.ReactNode
}) {

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return <SessionProvider>{children}</SessionProvider>
}