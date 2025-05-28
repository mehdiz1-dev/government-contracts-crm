// src/app/(auth)/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // If someone lands on this page without an OAuth flow,
    // just redirect them to the login page.
    console.log('AuthCallbackPage: Not an OAuth flow, redirecting to login.');
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p>If you're not automatically redirected, please click the link below.</p>
        <button
          onClick={() => router.replace('/login')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}