import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { TransactionsProvider } from "@/contexts/transactions-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Finanças Gest",
  description: "Gerencie suas finanças pessoais",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TransactionsProvider>
              <Toaster />
              {children}
            </TransactionsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
