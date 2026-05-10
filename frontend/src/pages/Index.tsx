import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Zap, Send } from "lucide-react";
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
        <img src={heroBg} alt="" className="absolute inset-x-0 top-12 bottom-0 w-full h-auto min-h-full object-cover opacity-40" />
        <div className="absolute inset-x-0 top-12 bottom-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
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

      {/* Contact Section ONLY changed */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-6">Contact Us</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center">
        © 2026 HireFlow
      </footer>
    </div>
  );
};

export default Index;