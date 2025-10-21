'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted || status === 'loading') return;
    
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [session, status, router, mounted]);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}