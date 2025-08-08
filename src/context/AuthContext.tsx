import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: any;
  email: string;
  role: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  email: '',
  role: '',
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');

  const getUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles') // ganti kalau role disimpan di tabel lain
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(profile?.role || '');
    } else {
      setRole('');
    }
  };

  useEffect(() => {
    getUserData();

    // Listener perubahan login/logout
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      getUserData();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        email: user?.email || '',
        role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
