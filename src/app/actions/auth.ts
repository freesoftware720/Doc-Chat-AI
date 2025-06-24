'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
  const supabase = createClient()

  // type-safe access to form data
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: 'Could not authenticate user. Please check your credentials.' };
  }

  revalidatePath('/', 'layout')
  redirect('/app')
}

export async function register(prevState: any, formData: FormData) {
  const supabase = createClient()

  const data = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
      },
    },
  })

  if (error) {
    return { error: 'Could not create user. Please try again.' };
  }

  return { success: 'Check your email to verify your account.' }
}


export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}


export async function sendPasswordResetEmail(prevState: any, formData: FormData) {
  const supabase = createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').origin}/auth/reset-password`,
  })

  if (error) {
    return { error: 'Could not send reset link. Please try again.' };
  }

  return { success: 'Password reset link sent. Check your email.' };
}

export async function resetPassword(prevState: any, formData: FormData) {
  const supabase = createClient()
  const password = formData.get('password') as string
  const code = formData.get('code') as string

  if (!code) {
    return { error: 'Missing password reset token. Please request a new link.' };
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return { error: 'Invalid or expired token. Please try again.' };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })

  if (updateError) {
    return { error: 'Could not reset password. Please try again.' };
  }

  redirect('/app')
}

export async function signInWithGithub() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: 'Could not sign in with Github. Please try again.' };
  }
  
  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithGoogle() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').origin}/auth/callback`,
        },
    });

    if (error) {
       return { error: 'Could not sign in with Google. Please try again.' };
    }

    if (data.url) {
        redirect(data.url);
    }
}
