import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { emissions } from "@/lib/api";
import {
  Leaf,
  BarChart3,
  TrendingDown,
  FileText,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Globe,
  Loader2,
} from "lucide-react";

const StatsSection = () => {
  const [stats, setStats] = useState({ tracked: 0, reduced: "0", progress: "0" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await emissions.getPublicStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch public stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="mt-20 flex justify-center opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mt-20 grid gap-8 sm:grid-cols-3 opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="text-center">
        <p className="text-4xl font-bold gradient-text">
          {stats.tracked.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">kg CO₂ Tracked</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold gradient-text">{stats.reduced}%</p>
        <p className="mt-1 text-sm text-muted-foreground">Emissions Reduced</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold gradient-text">{stats.progress}%</p>
        <p className="mt-1 text-sm text-muted-foreground">Global Goal Progress</p>
      </div>
    </div>
  );
};

const features = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track your carbon footprint with live data visualization and interactive dashboards.",
  },
  {
    icon: TrendingDown,
    title: "Emission Tracking",
    description: "Monitor electricity, transport, and waste emissions across all your operations.",
  },
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    description: "Get AI-powered suggestions to reduce your environmental impact effectively.",
  },
  {
    icon: FileText,
    title: "Downloadable Reports",
    description: "Generate comprehensive PDF and Excel reports for stakeholders and audits.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Arctic<span className="text-primary">Zero</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="hidden sm:inline-flex">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="sm:h-10 sm:px-4 sm:py-2">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary opacity-0 animate-fade-in">
              <Globe className="h-4 w-4" />
              <span>Sustainability Made Simple</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
              Measure, Analyze &{" "}
              <span className="gradient-text">Reduce</span>{" "}
              Your Carbon Footprint
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
              ArcticZero helps organizations track emissions, visualize trends, and take actionable
              steps toward a sustainable future. Start your journey to net-zero today.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <Link to="/dashboard">
                <Button size="xl" variant="hero" className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/data-input">
                <Button size="xl" variant="hero-outline">
                  Upload Emission Data
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <StatsSection />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Everything You Need for Carbon Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools to measure, monitor, and minimize your environmental impact.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group glass-card rounded-xl p-6 hover-lift opacity-0 animate-fade-in"
                style={{ animationDelay: `${500 + index * 100}ms` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-arctic-800 via-arctic-700 to-ocean-600 p-8 sm:p-12 lg:p-16">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
                Ready to Start Your Sustainability Journey?
              </h2>
              <p className="mb-8 text-lg text-primary-foreground/80">
                Join organizations worldwide in tracking and reducing their carbon footprint.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-background text-foreground hover:bg-background/90">
                    Get Started Free
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Free demo available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="font-semibold">ArcticZero</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ArcticZero. Building a sustainable future together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
