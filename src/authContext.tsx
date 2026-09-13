import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/supabaseClient';
import type { DriverProfile, Settings } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: DriverProfile | null;
  settings: Settings | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const defaultSettings: Settings = {
  id: '',
  user_id: '',
  normal_rate: 1.60,
  express_rate: 3.60,
  saturday_hourly_rate: 48.14,
  theme: 'light',
  updated_at: '',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('Error loading profile:', error);
      return;
    }
    setProfile(data);
  }

  async function loadSettings(userId: string) {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.error('Error loading settings:', error);
      return;
    }
    if (data) {
      setSettings(data);
    } else {
      const { data: newSettings, error: insertError } = await supabase
        .from('settings')
        .insert({ user_id: userId })
        .select()
        .maybeSingle();
      if (insertError) {
        console.error('Error creating settings:', insertError);
        setSettings({ ...defaultSettings, user_id: userId });
      } else {
        setSettings(newSettings);
      }
    }
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        Promise.all([loadProfile(session.user.id), loadSettings(session.user.id)]).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await Promise.all([loadProfile(session.user.id), loadSettings(session.user.id)]);
        } else {
          setProfile(null);
          setSettings(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('driver_profiles').insert({
        id: data.user.id,
        full_name: fullName,
      });
      await supabase.from('settings').insert({ user_id: data.user.id });
    }
    return { error: null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setSettings(null);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id);
  }

  async function refreshSettings() {
    if (user) await loadSettings(user.id);
  }

  async function updateSettings(updates: Partial<Settings>) {
    if (!user || !settings) return;
    const { data, error } = await supabase
      .from('settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (error) {
      console.error('Error updating settings:', error);
      return;
    }
    if (data) setSettings(data);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        settings,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        refreshSettings,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
