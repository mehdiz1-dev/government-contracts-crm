// src/app/(auth)/signup/page.tsx
'use client';
import { useState } from 'react'; import { useRouter } from 'next/navigation'; import { supabase } from '@/lib/supabase'; import Link from 'next/link';
export default function SignupPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false); const [message, setMessage] = useState<string | null>(null); const router = useRouter();
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setMessage(null);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password, });
    if (signUpError) { setError(signUpError.message); }
    else if (data.user) { setMessage('Account created! Please check your email to confirm your account.'); }
    else { setMessage('A confirmation email has been sent to your address. Please verify to log in.'); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up for CRM</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>} {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
        <form onSubmit={handleSignup}>
          <div><label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label><input type="email" id="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label><input type="password" id="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" disabled={loading}> {loading ? 'Signing up...' : 'Sign Up'} </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login</Link></p>
      </div>
    </div>
  );
}