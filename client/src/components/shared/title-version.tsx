"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "../ui/toast";

export function Title() {

  return (
    <p>
        Ledger 1.0 beta
    </p>
  );
}
