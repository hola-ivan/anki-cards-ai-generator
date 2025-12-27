"use client";

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (replace with your publishable key from .env later)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function Pricing() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleCheckout = async (priceId: string, mode: 'subscription' | 'payment') => {
        setLoading(priceId);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId, mode }),
            });

            const { url, error } = await res.json();
            if (error) throw new Error(error);

            if (url) {
                window.location.href = url;
            }
        } catch (err: any) {
            alert(err.message || "Checkout failed");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto text-center mb-16">
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Simple, Transparent Pricing</h1>
                <p className="text-xl text-slate-500">Choose the plan that fits your learning pace.</p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Free Plan */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">Starter</h3>
                        <div className="text-sm text-slate-500 font-medium">For casual learners</div>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-black text-slate-900">$0</span>
                        <span className="text-slate-500">/mo</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center text-slate-600">
                            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                            1 Deck per month
                        </li>
                        <li className="flex items-center text-slate-600">
                            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                            Max 10 cards
                        </li>
                        <li className="flex items-center text-slate-600">
                            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                            Basic Exports
                        </li>
                    </ul>
                    <button className="w-full py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                        Current Plan
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-slate-900 rounded-[2rem] shadow-xl p-8 flex flex-col relative transform md:-translate-y-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest shadow-lg">
                        POPULAR
                    </div>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-white">Pro</h3>
                        <div className="text-sm text-slate-400 font-medium">For serious students</div>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-black text-white">$9.99</span>
                        <span className="text-slate-400">/mo</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center text-slate-300">
                            <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                            <strong>500 Cards</strong> per month
                        </li>
                        <li className="flex items-center text-slate-300">
                            <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                            Priority Generation
                        </li>
                        <li className="flex items-center text-slate-300">
                            <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                            Premium AI Images (Flux)
                        </li>
                        <li className="flex items-center text-slate-300">
                            <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                            HD Neural Audio
                        </li>
                    </ul>
                    <button
                        onClick={() => handleCheckout('price_1Sj4CpIx5VMMhTNxQLGlJt7d', 'subscription')}
                        className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50 hover:scale-105 active:scale-95"
                    >
                        {loading === 'price_1Sj4CpIx5VMMhTNxQLGlJt7d' ? 'Loading...' : 'Upgrade to Pro'}
                    </button>
                </div>

                {/* Credit Pack */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">Exam Cram</h3>
                        <div className="text-sm text-slate-500 font-medium">Pay-as-you-go</div>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-black text-slate-900">$5</span>
                        <span className="text-slate-500">/once</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center text-slate-600">
                            <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                            <strong>+100 Cards</strong>
                        </li>
                        <li className="flex items-center text-slate-600">
                            <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                            Never Expires
                        </li>
                        <li className="flex items-center text-slate-600">
                            <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs mr-3">✓</span>
                            Add to any plan
                        </li>
                    </ul>
                    <button
                        onClick={() => handleCheckout('price_1Sj3gNIx5VMMhTNxWvsY2tGR', 'payment')}
                        className="w-full py-4 rounded-xl font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all"
                    >
                        {loading === 'price_1Sj3gNIx5VMMhTNxWvsY2tGR' ? 'Loading...' : 'Buy Credits'}
                    </button>
                </div>
            </div>
        </div>
    );
}
