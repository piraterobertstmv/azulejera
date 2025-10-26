
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { AuthWrapper } from "../components/auth-wrapper";
import { Sidebar } from "../components/sidebar";
import Dashboard from "../components/dashboard";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-72 min-h-screen p-8 transition-all duration-300">
          <Dashboard />
        </main>
      </div>
    </AuthWrapper>
  );
}
