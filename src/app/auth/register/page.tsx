import { RegisterForm } from "@/components/auth/register-form";
import { AuthCard, AuthCardHeader, AuthCardTitle, AuthCardDescription, AuthCardFooter } from "@/components/auth/auth-card";

export default function RegisterPage() {
  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthCardTitle>Create an Account</AuthCardTitle>
        <AuthCardDescription>
          Join DocuChat AI to start chatting with your documents.
        </AuthCardDescription>
      </AuthCardHeader>
      
      <RegisterForm />

       <AuthCardFooter>
        <p className="text-sm text-muted-foreground">
          Already have an account? <a href="/auth/login" className="text-primary hover:underline">Sign In</a>
        </p>
      </AuthCardFooter>
    </AuthCard>
  )
}
