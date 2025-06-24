import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthCard, AuthCardFooter, AuthCardHeader, AuthCardTitle, AuthCardDescription } from "@/components/auth/auth-card";

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthCardTitle>Forgot Password</AuthCardTitle>
        <AuthCardDescription>
          Enter your email and we'll send you a link to reset your password.
        </AuthCardDescription>
      </AuthCardHeader>
      
      <ForgotPasswordForm />

      <AuthCardFooter>
        <p className="text-sm text-muted-foreground">
          Remember your password? <a href="/auth/login" className="text-primary hover:underline">Sign In</a>
        </p>
      </AuthCardFooter>
    </AuthCard>
  )
}
