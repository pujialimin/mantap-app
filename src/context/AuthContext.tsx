// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles') // ← ganti jika kamu simpan role di tempat lain
          .select('role')
          .eq('id', user.id)
          .single();

        setRole(profile?.role || '');
      }
    };

    getUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
