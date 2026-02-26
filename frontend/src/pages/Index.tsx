import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Zap, Users, Brain, ShieldCheck, Check, Star, Mail, Phone, MapPin, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import heroBg from "@/assets/hero-bg.png";

const features = [
  { icon: Brain, title: "AI-Powered Screening", desc: "Automated candidate evaluation with intelligent assessments and scoring." },
  { icon: Users, title: "Smart Job Board", desc: "Dynamic job listings with real-time application tracking for candidates." },
  { icon: ShieldCheck, title: "End-to-End Pipeline", desc: "From job posting to team allocation — manage the entire recruitment lifecycle." },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "For small teams getting started",
    features: ["Up to 5 job postings", "Basic AI screening", "Email support", "Candidate tracking"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/mo",
    desc: "For growing companies",
    features: ["Unlimited job postings", "Advanced AI assessments", "AI-powered interviews", "Priority support", "Analytics dashboard", "Team allocation"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$149",
    period: "/mo",
    desc: "For large organizations",
    features: ["Everything in Pro", "Custom integrations", "Dedicated account manager", "SSO & advanced security", "Custom AI models", "SLA guarantee"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const testimonials = [
  { name: "Sarah Chen", role: "VP of Engineering, TechCorp", text: "HireFlow cut our hiring time by 60%. The AI screening is incredibly accurate.", rating: 5 },
  { name: "Marcus Johnson", role: "HR Director, ScaleUp Inc", text: "The 5-step wizard makes complex recruitment pipelines feel effortless.", rating: 5 },
  { name: "Priya Sharma", role: "Talent Lead, InnovateCo", text: "Best recruitment tool we've used. The AI interviews are a game-changer.", rating: 5 },
];

const Index = () => (
  <div className="min-h-screen">
    <Navbar />

    {/* Hero */}
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img src={heroBg} alt="" className="absolute inset-x-0 top-12 bottom-0 w-full h-auto min-h-full object-cover opacity-40" />
      <div className="absolute inset-x-0 top-12 bottom-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      <div className="relative z-10 container mx-auto px-4 text-center pt-12">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 md:mb-8 animate-fade-in">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium">AI-Driven Recruitment Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-4 md:mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <span className="text-gradient">HireFlow</span>
          <br />
          <span className="text-foreground">AI Recruitment</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 px-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Streamline your hiring pipeline with AI-powered assessments, smart interviews, and seamless team allocation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Link to="/signup">
            <Button size="lg" className="glow-primary text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">Get Started</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 glass w-full sm:w-auto">Login</Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-16 md:py-24 container mx-auto px-4">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-center mb-10 md:mb-16">
        Everything you need to <span className="text-gradient">hire smarter</span>
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {features.map((f, i) => (
          <div key={f.title} className="glass rounded-2xl p-6 md:p-8 glass-hover animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-display font-semibold mb-2 md:mb-3">{f.title}</h3>
            <p className="text-sm md:text-base text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Pricing */}
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-center mb-4">
          Simple, transparent <span className="text-gradient">pricing</span>
        </h2>
        <p className="text-muted-foreground text-center mb-10 md:mb-16 max-w-xl mx-auto text-sm md:text-base">Choose the plan that fits your hiring needs. Upgrade or cancel anytime.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 md:p-8 animate-fade-in flex flex-col ${
                plan.highlight
                  ? "glass border-primary/40 glow-primary-sm relative"
                  : "glass glass-hover"
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg md:text-xl font-display font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-3xl md:text-4xl font-display font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className={`w-full ${plan.highlight ? "glow-primary" : ""}`} variant={plan.highlight ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials / Feedback */}
    <section className="py-16 md:py-24 container mx-auto px-4">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-center mb-4">
        Trusted by <span className="text-gradient">hiring teams</span>
      </h2>
      <p className="text-muted-foreground text-center mb-10 md:mb-16 max-w-xl mx-auto text-sm md:text-base">See what our customers have to say about HireFlow.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {testimonials.map((t, i) => (
          <div key={t.name} className="glass rounded-2xl p-6 md:p-8 glass-hover animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm md:text-base text-foreground mb-6 italic">"{t.text}"</p>
            <div>
              <p className="font-display font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Contact */}
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-center mb-4">
          Get in <span className="text-gradient">touch</span>
        </h2>
        <p className="text-muted-foreground text-center mb-10 md:mb-16 max-w-xl mx-auto text-sm md:text-base">Have questions? We'd love to hear from you.</p>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 glass-hover">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm">Email</p>
                  <p className="text-sm text-muted-foreground">hello@hireflow.ai</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-6 glass-hover">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-6 glass-hover">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm">Office</p>
                  <p className="text-sm text-muted-foreground">San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>
          {/* Contact Form */}
          <div className="glass rounded-2xl p-6 md:p-8">
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div>
                <Label htmlFor="contact-name">Name</Label>
                <Input id="contact-name" placeholder="Your name" className="mt-1.5 glass" />
              </div>
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" type="email" placeholder="you@example.com" className="mt-1.5 glass" />
              </div>
              <div>
                <Label htmlFor="contact-message">Message</Label>
                <Textarea id="contact-message" placeholder="How can we help?" className="mt-1.5 glass" rows={4} />
              </div>
              <Button className="w-full glow-primary-sm gap-2">
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        © 2026 HireFlow. AI-Driven Recruitment Platform.
      </div>
    </footer>
  </div>
);

export default Index;
