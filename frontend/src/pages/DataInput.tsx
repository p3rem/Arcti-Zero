import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fuelTypes } from "@/data/mockData";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Zap, Car, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "@/context/SearchContext"; // Import context

import { emissions } from "@/lib/api";

export default function DataInput() {
  const { toast } = useToast();
  const { searchQuery } = useSearch(); // Use context
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    electricity: "",
    transportDistance: "",
    fuelType: "petrol_car", // Default to match seed data
    waste: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Fetch entries on load
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const res = await emissions.getAll();
      setEntries(res.data);
    } catch (err) {
      console.error("Failed to load entries", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Filter logic
  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      entry.category?.toLowerCase().includes(lowerQuery) ||
      entry.source?.toLowerCase().includes(lowerQuery) ||
      entry.date?.includes(lowerQuery) ||
      entry.unit?.toLowerCase().includes(lowerQuery)
    );
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const promises = [];

      if (formData.electricity) {
        promises.push(emissions.create({
          category: 'electricity',
          subcategory: 'grid_india',
          activity_data: Number(formData.electricity),
          unit: 'kWh',
          date: formData.date
        }));
      }

      if (formData.transportDistance) {
        // Map fuel types to backend subcategories if needed, or use exact matches
        // Assuming select values match seed: 'passenger_car_gasoline', etc.
        promises.push(emissions.create({
          category: 'transport',
          subcategory: formData.fuelType || 'petrol_car',
          activity_data: Number(formData.transportDistance),
          unit: 'km',
          date: formData.date
        }));
      }

      if (formData.waste) {
        promises.push(emissions.create({
          category: 'waste',
          subcategory: 'organic', // Default
          activity_data: Number(formData.waste),
          unit: 'kg',
          date: formData.date
        }));
      }

      if (promises.length === 0) {
        toast({ title: "No data to submit", description: "Please fill at least one field." });
        setIsSubmitting(false);
        return;
      }

      await Promise.all(promises);

      toast({
        title: "Data submitted successfully!",
        description: "Your emission data has been recorded.",
      });

      handleReset();

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Submission failed",
        description: error.response?.data?.error || "Could not save data",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      electricity: "",
      transportDistance: "",
      fuelType: "",
      waste: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        if (!text) return;

        try {
          // Simple CSV Parser
          const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

          const rows = lines.slice(1);
          const promises = [];
          let submittedCount = 0;

          // Helper to get index
          const getIdx = (name: string) => headers.findIndex(h => h.includes(name));

          const idxDate = getIdx('date');
          const idxElec = getIdx('electricity');
          const idxTrans = getIdx('transport');
          const idxFuel = getIdx('fuel');
          const idxWaste = getIdx('waste');

          if (idxDate === -1) {
            toast({ title: "Invalid CSV Format", description: "Missing 'date' column", variant: "destructive" });
            return;
          }

          setIsSubmitting(true);

          for (const row of rows) {
            const cols = row.split(',').map(c => c.trim());
            if (cols.length < headers.length) continue;

            const date = cols[idxDate];
            const elec = cols[idxElec] ? Number(cols[idxElec]) : 0;
            const trans = cols[idxTrans] ? Number(cols[idxTrans]) : 0;
            const fuelRaw = cols[idxFuel];
            const waste = cols[idxWaste] ? Number(cols[idxWaste]) : 0;

            // Map Fuel Type
            let fuelType = 'petrol_car';
            const f = fuelRaw?.toLowerCase() || '';
            if (f.includes('diesel')) fuelType = 'diesel_car';
            else if (f.includes('two') || f.includes('bike')) fuelType = 'two_wheeler';
            else if (f.includes('bus')) fuelType = 'bus';
            else if (f.includes('electric') || f.includes('ev')) fuelType = 'electric_vehicle';
            else if (f.includes('air') && f.includes('short')) fuelType = 'air_travel_short_haul';
            else if (f.includes('air')) fuelType = 'air_travel_long_haul';

            // Create Electricity Record
            if (elec > 0) {
              promises.push(emissions.create({
                category: 'electricity',
                subcategory: 'grid_india',
                activity_data: elec,
                unit: 'kWh',
                date
              }));
            }

            // Create Transport Record
            if (trans > 0) {
              promises.push(emissions.create({
                category: 'transport',
                subcategory: fuelType,
                activity_data: trans,
                unit: 'km',
                date
              }));
            }

            // Create Waste Record
            if (waste > 0) {
              promises.push(emissions.create({
                category: 'waste',
                subcategory: 'organic', // Defaulting for bulk upload
                activity_data: waste,
                unit: 'kg',
                date
              }));
            }
          }

          if (promises.length > 0) {
            await Promise.all(promises);
            toast({
              title: "CSV Uploaded Successfully",
              description: `Processed ${rows.length} rows and created ${promises.length} records.`,
              variant: "default" // success
            });
          } else {
            toast({ title: "No valid data found in CSV", variant: "destructive" });
          }

        } catch (error) {
          console.error("CSV Parse Error", error);
          toast({ title: "Failed to process CSV", description: "Check console for details", variant: "destructive" });
        } finally {
          setIsSubmitting(false);
        }
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Input</h1>
          <p className="text-muted-foreground">Add your emission data manually or upload a CSV file</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Manual Entry Form */}
          <Card className="opacity-0 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Manual Data Entry
              </CardTitle>
              <CardDescription>
                Enter your emission data for individual categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="electricity">Electricity Consumption</Label>
                    <div className="relative">
                      <Input
                        id="electricity"
                        type="number"
                        placeholder="0"
                        value={formData.electricity}
                        onChange={(e) => handleInputChange("electricity", e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        kWh
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transport">Transport Distance</Label>
                    <div className="relative">
                      <Input
                        id="transport"
                        type="number"
                        placeholder="0"
                        value={formData.transportDistance}
                        onChange={(e) => handleInputChange("transportDistance", e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        km
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select
                      value={formData.fuelType}
                      onValueChange={(value) => handleInputChange("fuelType", value)}
                    >
                      <SelectTrigger id="fuelType">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((fuel) => (
                          <SelectItem key={fuel.value} value={fuel.value}>
                            {fuel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waste">Waste Generated</Label>
                    <div className="relative">
                      <Input
                        id="waste"
                        type="number"
                        placeholder="0"
                        value={formData.waste}
                        onChange={(e) => handleInputChange("waste", e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        kg
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Submit Data
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* CSV Upload */}
          <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                CSV Upload
              </CardTitle>
              <CardDescription>
                Upload a CSV file with bulk emission data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Drag and drop your CSV file here</p>
                    <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Browse Files
                  </Button>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-medium">CSV Format Requirements:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success shrink-0" />
                    <span>Headers: date, electricity_kwh, transport_km, fuel_type, waste_kg</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success shrink-0" />
                    <span>Date format: YYYY-MM-DD</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-warning shrink-0" />
                    <span>Maximum file size: 5MB</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries Section */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Entries</h2>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>

          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm text-left">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[150px]">Date</th>
                      <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Category</th>
                      <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Activity</th>
                      <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Emission</th>
                      <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Source</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredEntries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading data...
                            </div>
                          ) : searchQuery ? (
                            "No entries match your search."
                          ) : (
                            "No entries found."
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredEntries.map((entry: any) => (
                        <tr key={entry.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-medium">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="p-4 align-middle capitalize">
                            <div className="flex items-center gap-2">
                              {entry.category === 'electricity' && <Zap className="h-4 w-4 text-warning" />}
                              {entry.category === 'transport' && <Car className="h-4 w-4 text-blue-500" />}
                              {entry.category === 'waste' && <Trash2 className="h-4 w-4 text-gray-500" />}
                              {entry.category}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            {entry.activity_data} <span className="text-muted-foreground text-xs">{entry.unit}</span>
                          </td>
                          <td className="p-4 align-middle font-bold text-primary">
                            {Number(entry.calculated_co2e).toFixed(2)} kg
                          </td>
                          <td className="p-4 align-middle text-xs text-muted-foreground capitalize">
                            {entry.source}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
