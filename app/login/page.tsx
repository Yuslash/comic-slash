'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, guestLogin } from '@/lib/api/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            router.push('/studio'); // Redirect to studio after login
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    const handleGuest = async () => {
        try {
            await guestLogin();
            router.push('/studio');
        } catch (err) {
            setError('Guest access failed. System overload.');
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark flex items-center justify-center font-rajdhani text-white">
            <div className="bg-neutral-900 border border-white/10 p-8 w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#ccff00]/10 blur-[50px]"></div>

                <h2 className="text-4xl font-teko uppercase mb-6 text-center text-white">
                    Agent <span className="text-[#ccff00]">Login</span>
                </h2>

                {error && <div className="bg-red-900/50 text-red-200 p-2 mb-4 text-sm border border-red-500/30 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-white/20 p-2 text-white focus:border-[#ccff00] outline-none transition-colors"
                            placeholder="agent@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-white/20 p-2 text-white focus:border-[#ccff00] outline-none transition-colors"
                        />
                    </div>

                    <button type="submit" className="mt-4 bg-[#ccff00] text-black font-teko text-xl uppercase py-2 hover:bg-white transition-colors clip-path-button">
                        Access Terminal
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">OR</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <button type="button" onClick={handleGuest} className="bg-transparent border border-white/20 text-white font-teko text-xl uppercase py-2 hover:bg-white/10 transition-colors">
                        Enter as Guest
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-500 text-sm">
                    First time? <Link href="/signup" className="text-white underline decoration-[#ccff00]">Register Clearance</Link>
                </p>
            </div>
        </div>
    );
}
