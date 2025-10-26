
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { AuthWrapper } from "../../components/auth-wrapper";
import { Sidebar } from "../../components/sidebar";
import PedidosListado from "../../components/pedidos-listado";

export default async function PedidosPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-72 min-h-screen p-8 transition-all duration-300">
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border-l-4 border-purple-500">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Pedidos</h1>
            </div>
            <PedidosListado />
          </div>
        </main>
      </div>
    </AuthWrapper>
  );
}
