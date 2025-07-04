
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { serviceSupabase } from '@/lib/supabase/service'
import { logAuditEvent } from './workspace'

export async function login(prevState: any, formData: FormData) {
  try {
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
  } catch (e: any) {
    console.error('Login action failed:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }
}

export async function register(prevState: any, formData: FormData) {
  try {
    const supabase = createClient()

    const data = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }
    const referralCode = formData.get('referralCode') as string | null;

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    })

    if (error) {
      console.error('Supabase sign up error:', error.message);
      return { error: 'Could not create user. Please try again.' };
    }
    
    if (signUpData.user && referralCode) {
      if (!serviceSupabase) {
          console.warn("Referral processed without service client. Credits may not be applied.");
      } else {
          // Use a try/catch to not block registration if referral processing fails
          try {
              // 1. Find referrer by code
              const { data: referrerProfile } = await serviceSupabase
                  .from('profiles')
                  .select('id, pro_credits')
                  .eq('referral_code', referralCode)
                  .single();

              if (referrerProfile) {
                  const newUserId = signUpData.user.id;
                  const referrerId = referrerProfile.id;
                  const creditsToAward = 1; // e.g., 1 month of Pro

                  // 2. Update new user's profile with who referred them
                  await serviceSupabase
                      .from('profiles')
                      .update({ referred_by: referrerId })
                      .eq('id', newUserId);

                  // 3. Update referrer's profile with new credits
                  await serviceSupabase
                      .from('profiles')
                      .update({ pro_credits: (referrerProfile.pro_credits || 0) + creditsToAward })
                      .eq('id', referrerId);

                  // 4. Log the successful referral
                  await serviceSupabase
                      .from('referrals')
                      .insert({ referrer_id: referrerId, referred_id: newUserId });
              }
          } catch (referralError: any) {
              console.error("Failed to process referral:", referralError.message);
              // Don't throw, as the user has already been created.
          }
      }
    }

    return { success: 'Check your email to verify your account.' }
  } catch (e: any) {
    console.error('Register action failed:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }
}


export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}


export async function sendPasswordResetEmail(prevState: any, formData: FormData) {
  try {
    const supabase = createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').origin}/auth/reset-password`,
    })

    if (error) {
      return { error: 'Could not send reset link. Please try again.' };
    }

    return { success: 'Password reset link sent. Check your email.' };
  } catch (e: any) {
    console.error('Send password reset email action failed:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }
}

export async function resetPassword(prevState: any, formData: FormData) {
  try {
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
  } catch (e: any) {
    console.error('Reset password action failed:', e);
    return { error: `An unexpected error occurred: ${e.message}` };
  }
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
