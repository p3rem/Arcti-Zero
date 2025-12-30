import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Zap, TrendingUp, TrendingDown, Leaf, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface InsightData {
  logic: {
    hotspot: {
      category: string;
      total: string;
    };
    trend: {
      direction: 'increasing' | 'decreasing' | 'stable';
      percent: string;
      currentMonth: string;
      previousMonth: string;
    };
  };
  ai: {
    available: boolean;
    summary: string;
    recommendation: string;
  };
}

export default function Recommendations() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recommendations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch insights');

        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        setError("Could not load recommendations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights Engine</h1>
          <p className="text-muted-foreground mt-2">
            Data-driven analytics and AI-powered recommendations to optimize your carbon footprint.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        ) : data ? (
          <>
            {/* 1. Logic-Based Insights Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Emission Source</CardTitle>
                  <Zap className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{data.logic.hotspot.category || "None"}</div>
                  <p className="text-xs text-muted-foreground">
                    Responsible for {data.logic.hotspot.total} kg CO₂e this year.
                  </p>
                  <div className="mt-4">
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                      Action Needed
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
                  {data.logic.trend.direction === 'increasing' ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {data.logic.trend.direction}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Emissions shifted by {data.logic.trend.percent}% from {data.logic.trend.previousMonth} to {data.logic.trend.currentMonth}.
                  </p>
                  <div className="mt-4">
                    {data.logic.trend.direction === 'decreasing' && (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        On Track
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 2. AI-Assisted Insights Section */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  <CardTitle>AI-Assisted Insights</CardTitle>
                </div>
                <CardDescription>
                  Generative suggestions based on your unique emission patterns.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.ai.available ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <h4 className="font-semibold text-sm mb-1 text-foreground">Summary</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {data.ai.summary}
                      </p>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <h4 className="font-semibold text-sm mb-1 text-primary">Recommendation</h4>
                      <p className="text-sm text-primary/80 leading-relaxed">
                        {data.ai.recommendation}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-right italic">
                      Generated by Groq. AI suggestions are advisory only.
                    </p>
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>AI Insights Unavailable</AlertTitle>
                    <AlertDescription>{data.ai.summary}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-muted-foreground">No data found to analyze.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
