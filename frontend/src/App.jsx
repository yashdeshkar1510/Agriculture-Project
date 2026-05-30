import {
  ArrowRight,
  BarChart3,
  BellRing,
  BrainCircuit,
  CircleDollarSign,
  Landmark,
  LineChart,
  Globe,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Sparkles,
  CloudRain,
  Send,
  Share2,
  Users,
} from 'lucide-react'
import './App.css'

const navLinks = ['Home', 'Features', 'About', 'Contact']

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Credit Scoring',
    description:
      'Assess farmers with transparent AI models that blend crop history, cash flow, and field data.',
  },
  {
    icon: CloudRain,
    title: 'Weather Intelligence',
    description:
      'Use location-aware weather signals to anticipate planting risk and protect lending decisions.',
  },
  {
    icon: CircleDollarSign,
    title: 'Loan Recommendations',
    description:
      'Recommend fair loan amounts and repayment windows based on actual agricultural performance.',
  },
  {
    icon: LineChart,
    title: 'Farm Analytics',
    description:
      'Track yield, seasonality, and productivity with executive-grade analytics dashboards.',
  },
  {
    icon: BellRing,
    title: 'Risk Monitoring',
    description:
      'Continuously monitor farm risk with real-time alerts across climate, crop, and financial signals.',
  },
  {
    icon: Users,
    title: 'Financial Inclusion',
    description:
      'Bring underserved farmers into formal finance through trusted, data-backed lending workflows.',
  },
]

const stats = [
  { value: '120K+', label: 'Total Farmers', detail: 'Profiles validated across regions' },
  { value: '$48M', label: 'Loans Approved', detail: 'Capital delivered through fair assessments' },
  { value: '2.4M', label: 'Crop Analysis', detail: 'Data points processed every season' },
  { value: '96%', label: 'Risk Accuracy', detail: 'Model precision in lending decisions' },
]

const footerLinks = ['Home', 'Features', 'About', 'Contact']

const socialLinks = [
  { icon: Globe, label: 'Website' },
  { icon: MessageCircle, label: 'Community' },
  { icon: Send, label: 'Messages' },
  { icon: Share2, label: 'Share' },
]

function App() {
  return (
    <div className="min-h-screen bg-[#03111a] text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.24),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.24),transparent_28%),linear-gradient(180deg,rgba(3,17,26,0.2),rgba(3,17,26,1))]" />
        <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute right-0 top-64 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl animate-drift-slower" />

        <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-blue-500 text-slate-950 shadow-lg shadow-emerald-500/30">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">
                  Agro Platform
                </p>
                <p className="text-sm text-slate-300">Agri-FinTech intelligence</p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300 sm:gap-6 xl:justify-center">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="transition hover:text-white"
                >
                  {link}
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#contact"
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/10"
              >
                Farmer Login
              </a>
              <a
                href="#dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:scale-[1.02]"
              >
                Bank Dashboard
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </header>

        <main className="relative z-10">
          <section id="home" className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 shadow-lg shadow-emerald-500/10">
                  <Sparkles className="h-4 w-4" />
                  Fair lending for modern agriculture
                </div>

                <div className="space-y-6">
                  <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl">
                    Bridging Agricultural Reality with Financial Trust
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                    Agro Platform helps farmers access fair loans using AI-driven analytics, weather
                    intelligence, and transparent risk models that banks can trust.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-50"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:border-blue-400/40 hover:bg-white/10"
                  >
                    Explore Dashboard
                  </a>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    'AI-backed underwriting',
                    'Climate-aware decisions',
                    'Built for financial inclusion',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300 backdrop-blur"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative" id="dashboard">
                <div className="absolute -left-6 top-10 hidden h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl lg:block" />
                <div className="absolute -right-4 bottom-10 hidden h-28 w-28 rounded-full bg-blue-400/20 blur-2xl lg:block" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl animate-float-slow">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Bank view</p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">Live lending dashboard</h2>
                    </div>
                    <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Active
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-gradient-to-br from-emerald-400/20 to-blue-500/10 p-5 ring-1 ring-white/10">
                      <p className="text-sm text-slate-300">Approval rate</p>
                      <p className="mt-3 text-4xl font-bold text-white">87%</p>
                      <p className="mt-2 text-sm text-emerald-200">+12% versus last quarter</p>
                    </div>
                    <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                      <p className="text-sm text-slate-300">Model confidence</p>
                      <p className="mt-3 text-4xl font-bold text-white">96.2</p>
                      <p className="mt-2 text-sm text-slate-400">Real-time scoring and risk monitoring</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                    {[
                      ['Farmer profile', 'Verified crop history and repayment patterns'],
                      ['Weather risk', 'Moderate rainfall disruption in 2 districts'],
                      ['Recommended loan', '$12,500 with seasonal repayment'],
                    ].map(([title, value]) => (
                      <div
                        key={title}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950/40 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{title}</p>
                          <p className="text-sm text-slate-400">{value}</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-emerald-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">
                Features
              </p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Tools that help lenders and farmers make better decisions together.
              </h2>
              <p className="text-slate-300">
                Designed for high-trust agricultural finance, with insights that turn field reality
                into actionable credit decisions.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="group rounded-[1.75rem] border border-white/10 bg-white/6 p-6 shadow-lg shadow-black/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 text-emerald-200 ring-1 ring-white/10 transition group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-400/10 to-blue-500/10 p-8 shadow-2xl shadow-black/15 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">
                  About
                </p>
                <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                  A startup-grade platform for inclusive agricultural finance.
                </h2>
                <p className="mt-5 max-w-xl leading-8 text-slate-300">
                  Agro Platform unifies agronomic, climatic, and financial signals into one clear
                  system, helping lenders understand risk and helping farmers gain access to capital
                  on fairer terms.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {stats.map(({ value, label, detail }) => (
                  <article
                    key={label}
                    className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 shadow-lg shadow-black/10 backdrop-blur"
                  >
                    <p className="text-4xl font-bold text-white">{value}</p>
                    <p className="mt-3 text-lg font-semibold text-emerald-200">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer id="contact" className="relative z-10 border-t border-white/10 bg-slate-950/70">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr_0.8fr] lg:px-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-blue-500 text-slate-950">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">
                    Agro Platform
                  </p>
                  <p className="text-sm text-slate-400">Agri-FinTech for smarter lending</p>
                </div>
              </div>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                Helping farmers unlock fair credit with AI, analytics, and trusted financial
                workflows.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">Quick Links</h3>
              <div className="mt-4 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                {footerLinks.map((link) => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="transition hover:text-white">
                    {link}
                  </a>
                ))}
              </div>

              <div className="mt-8 space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-emerald-300" />
                  <span>Nairobi, Kenya</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-emerald-300" />
                  <span>support@agroplatform.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-emerald-300" />
                  <span>+1 (800) 123-4567</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">Connect</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {socialLinks.map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-emerald-400/40 hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <p className="mt-6 text-sm leading-7 text-slate-400">
                Modern financial inclusion for agriculture, built to scale with your portfolio.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
