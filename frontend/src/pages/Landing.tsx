import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Clock, Users, Laptop, Zap, Code2, Brain,
  CheckCircle2, ChevronDown, ChevronUp, Share2, Rocket, Target,
  GraduationCap, MessageSquare, Bot, Cpu, Network
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const Landing: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    { icon: Brain, title: 'AI Fundamentals', desc: 'Understand how AI models work behind the scenes' },
    { icon: Code2, title: 'Hands-on Coding', desc: 'Write real Python code to build your AI project' },
    { icon: Bot, title: 'Working AI App', desc: 'Deploy a functional AI application by the end' },
    { icon: Cpu, title: 'Prompt Engineering', desc: 'Learn to communicate effectively with AI models' },
  ];

  const agenda = [
    { time: '0–10 min', title: 'Welcome & Setup', desc: 'Environment setup and introductions' },
    { time: '10–25 min', title: 'AI Concepts', desc: 'Core concepts made simple with real examples' },
    { time: '25–50 min', title: 'Build Together', desc: 'Step-by-step guided AI project development' },
    { time: '50–60 min', title: 'Ship & Share', desc: 'Deploy your project and share with peers' },
  ];

  const whoShouldAttend = [
    { icon: GraduationCap, text: 'Final-year engineering students curious about AI' },
    { icon: Code2, text: 'Students who want to add an AI project to their portfolio' },
    { icon: Target, text: 'Anyone looking to break into AI/ML careers' },
    { icon: Rocket, text: 'Beginners who want a practical start, not just theory' },
  ];

  const howItWorks = [
    { step: '01', title: 'Register Free', desc: 'Create your account in under a minute' },
    { step: '02', title: 'Get Your Link', desc: 'Share your referral link with classmates' },
    { step: '03', title: 'Join Live', desc: 'Attend the 60-minute online workshop' },
    { step: '04', title: 'Build & Ship', desc: 'Walk away with a working AI project' },
  ];


  const faqs = [
    { q: 'Is this workshop really free?', a: 'Yes, completely free. No hidden charges, no payment required. We believe in making AI education accessible to every aspiring engineer.' },
    { q: 'Do I need prior AI/ML experience?', a: 'No! This workshop is designed for beginners. If you can write basic code, you\'re ready. We\'ll guide you through every step.' },
    { q: 'What do I need to participate?', a: 'A laptop with internet connection and a web browser. We\'ll use cloud-based tools, so no complex installations needed.' },
    { q: 'Will I get a recording if I miss it?', a: 'The workshop is designed as a live, hands-on experience. We recommend attending live for the best learning experience. Details on recordings will be shared closer to the event.' },
    { q: 'Can I invite my friends?', a: 'Absolutely! After registering, you\'ll get a personal referral link. Share it with friends and track how many sign up through you.' },
  ];

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="gradient-bg relative overflow-hidden min-h-screen flex items-center">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Ambient glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.3), transparent 70%)' }} />

        <div className="relative page-wrapper pt-32 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Copy */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-8">
                <span className="badge badge-violet">
                  <Sparkles className="w-3.5 h-3.5" /> Free Online Workshop
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-8">
                Build Your First{' '}
                <span className="gradient-text">AI Project</span>{' '}
                in 60 Minutes.
              </motion.h1>

              <motion.p variants={fadeUp}
                className="text-lg sm:text-xl mb-10 max-w-xl"
                style={{ color: '#cbd5e1', lineHeight: '1.8' }}>
                Go from AI curiosity to a working project. Join a free, beginner-friendly
                online workshop designed for aspiring engineers.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-5 mb-12">
                <Link to="/signup?next=/onboarding" className="btn-primary text-base px-8 py-4">
                  <span>Reserve My Free Seat</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#what-youll-build" className="btn-secondary text-base px-8 py-4">
                  Explore the Workshop
                </a>
              </motion.div>

              <motion.div variants={fadeUp}
                className="flex flex-wrap gap-8 text-sm" style={{ color: '#94a3b8' }}>
                <span className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-cyan-400" /> 60 Minutes
                </span>
                <span className="flex items-center gap-3">
                  <Laptop className="w-4 h-4 text-violet-400" /> Online & Free
                </span>
                <span className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-emerald-400" /> Beginner Friendly
                </span>
              </motion.div>
            </motion.div>

            {/* Right — Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main card */}
                <div className="glass-card p-10 glow-violet">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs font-mono" style={{ color: '#64748b' }}>ai_project.py</span>
                  </div>
                  <pre className="text-sm font-mono leading-relaxed" style={{ color: '#e2e8f0' }}>
                    <code>
{`import openai

# Your first AI project 🚀
def analyze_sentiment(text):
    response = openai.chat.completions
      .create(
        model="gpt-4",
        messages=[{
          "role": "user",
          "content": f"Analyze: {text}"
        }]
      )
    return response.choices[0]

# Build. Ship. Impress.
result = analyze_sentiment(
  "AI is amazing!"
)
print(result)`}
                    </code>
                  </pre>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-4 -right-4 glass-card p-3 glow-cyan"
                >
                  <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-300">AI Connected</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 glass-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-300">60 min build</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU'LL LEARN ===== */}
      <section id="what-youll-build" className="relative">
        <div className="page-wrapper">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-20">
            <motion.span variants={fadeUp} className="badge badge-cyan mb-6 inline-flex">
              <Code2 className="w-3.5 h-3.5" /> Workshop Content
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-6">
              What You'll <span className="gradient-text">Learn & Build</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
              A practical, hands-on workshop that takes you from zero AI experience to a working project.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className="glass-card p-8 group cursor-default hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                  <f.icon className="w-7 h-7 text-violet-400" />
                </div>
                <h3 className="font-semibold text-lg mb-3 text-white">{f.title}</h3>
                <p className="text-sm" style={{ color: '#94a3b8', lineHeight: '1.7' }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== EXAMPLE PROJECT ===== */}
      <section style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
        <div className="page-wrapper">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-20">
              <span className="badge badge-emerald mb-6 inline-flex">
                <Rocket className="w-3.5 h-3.5" /> Demo Project
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Build an <span className="gradient-text">AI Sentiment Analyzer</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
                By the end of the workshop, you'll have a working AI app that can analyze text
                sentiment — positive, negative, or neutral — in real time.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="max-w-4xl mx-auto">
              <div className="glass-card overflow-hidden">
                <div className="p-5 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(139,92,246,0.15)' }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs font-mono ml-3" style={{ color: '#64748b' }}>AI Sentiment Analyzer — Live Preview</span>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="input-label">Enter text to analyze</label>
                      <textarea
                        className="input-field h-32 resize-none"
                        placeholder="Type any sentence here..."
                        defaultValue="I love learning about artificial intelligence! This workshop is going to be amazing."
                        readOnly
                      />
                    </div>
                    <div className="space-y-5">
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-emerald-400">Positive</span>
                          <span className="text-sm font-bold text-emerald-300">92%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: '92%', background: 'linear-gradient(90deg, #059669, #10b981)' }} />
                        </div>
                      </div>
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-amber-400">Neutral</span>
                          <span className="text-sm font-bold text-amber-300">6%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: '6%', background: '#f59e0b' }} />
                        </div>
                      </div>
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-rose-400">Negative</span>
                          <span className="text-sm font-bold text-rose-300">2%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: '2%', background: '#f43f5e' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== AGENDA ===== */}
      <section>
        <div className="page-wrapper">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-20">
              <span className="badge badge-violet mb-6 inline-flex">
                <Clock className="w-3.5 h-3.5" /> 60-Minute Agenda
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Workshop <span className="gradient-text">Roadmap</span>
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} className="max-w-3xl mx-auto space-y-6">
              {agenda.map((item, i) => (
                <div key={i} className="glass-card p-7 flex items-start gap-6 hover:-translate-y-0.5 transition-transform">
                  <div className="text-sm font-mono font-bold px-3 py-1.5 rounded-lg whitespace-nowrap"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                    {item.time}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm" style={{ color: '#94a3b8', lineHeight: '1.7' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== WHO SHOULD ATTEND ===== */}
      <section style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
        <div className="page-wrapper">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-20">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Who Should <span className="gradient-text">Attend?</span>
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {whoShouldAttend.map((item, i) => (
                <div key={i} className="flex items-start gap-5 glass-card p-7">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(34,211,238,0.1)' }}>
                    <item.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <p className="text-sm" style={{ color: '#e2e8f0', lineHeight: '1.7' }}>{item.text}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works">
        <div className="page-wrapper">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-20">
              <span className="badge badge-cyan mb-6 inline-flex">
                <Zap className="w-3.5 h-3.5" /> Simple Process
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                How <span className="gradient-text">Registration</span> Works
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, i) => (
                <div key={i} className="glass-card p-8 text-center hover:-translate-y-1 transition-transform">
                  <div className="text-4xl font-extrabold mb-5 gradient-text">{item.step}</div>
                  <h3 className="font-semibold text-lg text-white mb-3">{item.title}</h3>
                  <p className="text-sm" style={{ color: '#94a3b8', lineHeight: '1.7' }}>{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== REFERRAL ===== */}
      <section style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
        <div className="page-wrapper">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp}>
              <Share2 className="w-14 h-14 mx-auto mb-8 text-violet-400" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Invite Friends, <span className="gradient-text">Climb the Leaderboard</span>
              </h2>
              <p className="text-lg mb-10" style={{ color: '#94a3b8', lineHeight: '1.8' }}>
                After registering, you get a unique referral link. Share it with classmates
                and friends. Track how many people sign up through your link and compete
                on the referral leaderboard.
              </p>
              <div className="glass-card p-8 max-w-md mx-auto">
                <div className="text-xs font-mono mb-3" style={{ color: '#64748b' }}>Your referral link</div>
                <div className="input-field text-center text-sm" style={{ background: 'rgba(10,14,26,0.8)' }}>
                  nxtwave.tech/r/NW-XXXXXX
                </div>
                <p className="text-xs mt-4" style={{ color: '#64748b' }}>
                  Register to get your personalized link
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="badge badge-violet mb-6 inline-flex">
                <MessageSquare className="w-3.5 h-3.5" /> FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Frequently Asked <span className="gradient-text">Questions</span>
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-card overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-medium text-white pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-violet-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-violet-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6">
                      <p className="text-sm" style={{ color: '#94a3b8', lineHeight: '1.8' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative overflow-hidden gradient-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-8">
              Ready to Build Your First{' '}
              <span className="gradient-text">AI Project?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg mb-12" style={{ color: '#cbd5e1', lineHeight: '1.8' }}>
              Join hundreds of students taking their first step into AI. It's free,
              it's practical, and it only takes 60 minutes.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link to="/signup?next=/onboarding" className="btn-primary text-lg px-10 py-4">
                <span>Reserve My Free Seat Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
