import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthCard, AuthCardFooter, AuthCardHeader, AuthCardTitle, AuthCardDescription } from "@/components/auth/auth-card";

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthCardTitle>Reset Your Password</AuthCardTitle>
        <AuthCardDescription>
          Enter a new strong password for your account.
        </AuthCardDescription>
      </AuthCardHeader>
      
      <ResetPasswordForm />
      
      <AuthCardFooter>
        <p className="text-sm text-muted-foreground">
          Remember your password? <a href="/auth/login" className="text-primary hover:underline">Sign In</a>
        </p>
      </AuthCardFooter>
    </AuthCard>
  )
}
