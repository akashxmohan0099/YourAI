import Link from 'next/link'
import { ArrowRight, MessageSquare, Phone, Mail, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-lg font-semibold tracking-tight text-zinc-900">
          YourAI
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Get started
          </Link>
        </div>
      </nav>

      <div className="border-b border-zinc-100" />

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-32">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.15]">
            Your team that
            <br />
            never sleeps
          </h2>
          <p className="mt-5 text-lg text-zinc-500 leading-relaxed max-w-lg mx-auto">
            Handles calls, messages, emails, and bookings for your business around the clock — so you don&apos;t have to.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200 rounded-lg overflow-hidden">
          {[
            {
              icon: Phone,
              title: 'Voice calls',
              desc: 'Answer every call 24/7 with a voice that sounds natural and helpful.',
            },
            {
              icon: MessageSquare,
              title: 'Chat & SMS',
              desc: 'Respond to website chat and text messages instantly with full context.',
            },
            {
              icon: Mail,
              title: 'Email',
              desc: 'Draft and send replies to customer emails automatically.',
            },
            {
              icon: Shield,
              title: 'Owner control',
              desc: 'Set boundaries, approve actions, and stay in control from your phone.',
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white p-6">
              <feature.icon className="w-5 h-5 text-indigo-600 mb-3" strokeWidth={1.75} />
              <h3 className="text-sm font-semibold text-zinc-900">{feature.title}</h3>
              <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <p className="mt-16 text-center text-sm text-zinc-400">
          Trusted by 100+ Australian businesses
        </p>
      </main>
    </div>
  )
}
