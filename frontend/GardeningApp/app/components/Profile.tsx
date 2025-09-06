import { useEffect, useState } from 'react';
import supabase from '../../config/supabase';
import { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{name?: string}>({});

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        setProfile(profile || {});
      }
    }
    fetchData();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Profile</h1>
      <p><strong>Name:</strong> {profile.name || '(not set)'}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p>
        <strong>Email Verified:</strong>{' '}
        {user.email_confirmed_at ? 'Yes' : 'No'}
      </p>
    </div>
  );
}
