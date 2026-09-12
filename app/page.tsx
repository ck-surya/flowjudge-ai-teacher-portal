'use client'

import Link from 'next/link'
import { ArrowRight, LayoutDashboard, Brain, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <img src="/logo.png" alt="FlowJudge Logo" className="w-10 h-10 object-contain group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" />
            <span className="font-bold text-xl tracking-tight text-foreground">FlowJudge</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/teacher" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="px-5 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center">
          {/* Background Ambient Blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none blur-[100px] rounded-full bg-gradient-to-tr from-primary via-purple-500 to-rose-500 animate-pulse" style={{ animationDuration: '4s' }} />

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-primary text-sm font-medium mb-8 shadow-sm border border-border/50 animate-bounce" style={{ animationDuration: '3s' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Introducing FlowJudge AI Grading
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground leading-[1.1]">
              Grade Flowcharts with <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-rose-500 bg-clip-text text-transparent">Superhuman Speed</span>
            </h1>

            <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
              Automate the grading of student programming flowcharts using advanced AI. Provide instant feedback, manage classes effortlessly, and reclaim your time.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <Link href="/teacher" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group">
                Enter Teacher Portal
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-secondary text-foreground rounded-full font-medium border border-border hover:bg-secondary/80 hover:-translate-y-1 transition-all duration-300">
                Explore Features
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-secondary/30 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything you need to teach better</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Powerful tools designed specifically for programming instructors to manage assignments and grade flowcharts automatically.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: 'AI-Powered Grading',
                  desc: 'Automatically evaluate student flowcharts for logic, syntax, and algorithmic correctness in seconds.',
                  color: 'text-primary',
                  bg: 'bg-primary/10'
                },
                {
                  icon: Zap,
                  title: 'Instant Feedback',
                  desc: 'Students receive immediate, actionable feedback on their submissions, accelerating their learning loop.',
                  color: 'text-rose-500',
                  bg: 'bg-rose-500/10'
                },
                {
                  icon: LayoutDashboard,
                  title: 'Comprehensive Dashboard',
                  desc: 'Track class performance, view detailed analytics, and manage manual review requests all in one place.',
                  color: 'text-blue-500',
                  bg: 'bg-blue-500/10'
                }
              ].map((feature, idx) => (
                <div key={idx} className="group p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500" />
                  <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Ready to transform your classroom?</h2>
            <p className="text-xl text-muted-foreground mb-10">Join FlowJudge today and save hours of manual grading time every week.</p>
            <Link href="/teacher" className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-semibold shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/logo.png" alt="FlowJudge" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-foreground">FlowJudge</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 FlowJudge AI. All rights reserved.</p>
      </footer>
    </div>
  )
}
