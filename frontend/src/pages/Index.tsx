import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Zap, Send, CheckCircle2, Users, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import heroBg from "@/assets/hero-bg.png";
import { useState } from "react";
import api from "@/api/api";

const Index = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Use the pre-configured axios instance to automatically handle base URLs
      const res = await api.post("/echo", form);

      console.log("✅ Response:", res.data);

      alert("Message sent successfully!");

      // reset form
      setForm({ name: "", email: "", message: "" });

    } catch (err) {
      console.error(err);
      alert("❌ Failed to send message");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-x-0 top-12 bottom-0 w-full h-auto min-h-full object-cover opacity-70 dark:opacity-40" />
        <div className="absolute inset-x-0 top-12 bottom-0 bg-gradient-to-b from-background/10 via-background/50 to-background dark:from-background/60 dark:via-background/80 dark:to-background" />
        <div className="relative z-10 container mx-auto px-4 text-center pt-12">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI-Driven Recruitment Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            <span className="text-gradient">HireFlow</span>
            <br />
            <span className="text-foreground">AI Recruitment</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Streamline your hiring pipeline with AI-powered assessments, smart interviews, and seamless team allocation.
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How HireFlow Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A unified platform bridging the gap between top talent and growing companies through AI-driven recruitment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* For Recruiters */}
            <div className="glass p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10" />
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">For Recruiters</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">AI Resume Screening</p>
                    <p className="text-sm text-muted-foreground">Instantly parse and score resumes against your exact JD requirements.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Automated Assessments</p>
                    <p className="text-sm text-muted-foreground">Generate technical quizzes tailored to the role automatically.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Proctored Environment</p>
                    <p className="text-sm text-muted-foreground">Ensure assessment integrity with full-screen enforcement and tracking.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* For Candidates */}
            <div className="glass p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -z-10" />
              <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">For Candidates</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Transparent Pipeline</p>
                    <p className="text-sm text-muted-foreground">Track your application status in real-time without the guesswork.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Instant AI Feedback</p>
                    <p className="text-sm text-muted-foreground">Receive immediate results and detailed feedback on your assessments.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Frictionless Apply</p>
                    <p className="text-sm text-muted-foreground">One-click resume parsing automatically fills out your applications.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 relative overflow-hidden bg-muted/30">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-bottom-left -z-10" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Have questions about our enterprise plans or need technical support? Drop us a message.
            </p>
          </div>

          <div className="max-w-2xl mx-auto glass p-6 md:p-8 rounded-3xl">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Your Name</Label>
                    <Input
                      className="bg-background/50"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      className="bg-background/50"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    rows={5}
                    className="bg-background/50 resize-none"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto glow-primary">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-5xl mx-auto">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold mb-4">
                <Zap className="h-6 w-6 text-primary" />
                HireFlow
              </Link>
              <p className="text-muted-foreground text-sm max-w-xs">
                Enterprise-grade AI talent acquisition pipeline. Streamlining recruitment for modern teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-primary transition-colors">Recruiter Login</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Candidate Login</Link></li>
                <li><Link to="/signup" className="hover:text-primary transition-colors">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-border/40 text-sm text-muted-foreground">
            © {new Date().getFullYear()} HireFlow AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;