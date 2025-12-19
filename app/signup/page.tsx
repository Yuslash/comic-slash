'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup } from '@/lib/api/auth';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await signup(username, email, password);
            router.push('/studio');
        } catch (err) {
            setError('Error creating account. Email may be taken.');
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark flex items-center justify-center font-rajdhani text-white">
            <div className="bg-neutral-900 border border-white/10 p-8 w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-20 h-20 bg-[#00ccff]/10 blur-[50px]"></div>

                <h2 className="text-4xl font-teko uppercase mb-6 text-center text-white">
                    New <span className="text-[#00ccff]">Recruit</span>
                </h2>

                {error && <div className="bg-red-900/50 text-red-200 p-2 mb-4 text-sm border border-red-500/30 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Codename</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black border border-white/20 p-2 text-white focus:border-[#00ccff] outline-none transition-colors"
                            placeholder="Striker"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-white/20 p-2 text-white focus:border-[#00ccff] outline-none transition-colors"
                            placeholder="recruit@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-white/20 p-2 text-white focus:border-[#00ccff] outline-none transition-colors"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full bg-black border p-2 text-white focus:border-[#00ccff] outline-none transition-colors ${password && confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-white/20'}`}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="mt-4 bg-[#00ccff] text-black font-teko text-xl uppercase py-2 hover:bg-white transition-colors clip-path-button">
                        Register
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-500 text-sm">
                    Already an agent? <Link href="/login" className="text-white underline decoration-[#00ccff]">Login</Link>
                </p>
            </div>
        </div>
    );
}
