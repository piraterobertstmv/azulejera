
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import LoginForm from "../../components/login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mt-6 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Cursor Manager
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Business Management System
            </p>
          </div>
          <p className="mt-6 text-center text-sm text-gray-600">
            Inicia sesión en tu cuenta
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
