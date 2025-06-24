import { LoginForm } from "@/components/auth/login-form"
import { AuthCard, AuthCardHeader, AuthCardTitle, AuthCardDescription, AuthCardFooter } from "@/components/auth/auth-card"

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthCardTitle>Welcome Back</AuthCardTitle>
        <AuthCardDescription>
          Sign in to your account to continue where you left off.
        </AuthCardDescription>
      </AuthCardHeader>
      
      <LoginForm />

      <AuthCardFooter>
        <p className="text-sm text-muted-foreground">
          Don't have an account? <a href="/auth/register" className="text-primary hover:underline">Sign Up</a>
        </p>
      </AuthCardFooter>
    </AuthCard>
  )
}
