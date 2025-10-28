import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Gestión RSL</h1>
          <p className="text-muted-foreground">Universidad de las Fuerzas Armadas ESPE</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
