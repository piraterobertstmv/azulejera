
'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/toaster";
import { ChatWidget } from "./chat-widget";
import { useEffect, useState } from "react";

function ChatWidgetWrapper() {
  const { data: session } = useSession();
  
  // Only show chat widget if user is logged in
  if (!session) return null;
  
  return <ChatWidget />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
        <ChatWidgetWrapper />
      </ThemeProvider>
    </SessionProvider>
  );
}
