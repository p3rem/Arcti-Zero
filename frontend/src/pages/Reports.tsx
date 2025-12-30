import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Loader2,
  Calendar,
} from "lucide-react";
import { reports } from "@/lib/api";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function Reports() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("2024");
  const queryClient = useQueryClient();

  const { data: reportHistory = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await reports.getHistory();
      return res.data;
    }
  });

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const response = await reports.downloadPDF(Number(reportPeriod));

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `emissions_report_${reportPeriod}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      queryClient.invalidateQueries({ queryKey: ['reports'] }); // Refresh list
    } catch (error) {
      console.error("Failed to download PDF", error);
      alert("Failed to download PDF report");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setIsGeneratingExcel(true);
      const response = await reports.downloadExcel(Number(reportPeriod));

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `emissions_data_${reportPeriod}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      queryClient.invalidateQueries({ queryKey: ['reports'] }); // Refresh list
    } catch (error) {
      console.error("Failed to download Excel", error);
      alert("Failed to download Excel export");
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Generate and download emission reports</p>
          </div>
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">Year 2025</SelectItem>
              <SelectItem value="2024">Year 2024</SelectItem>
              <SelectItem value="2023">Year 2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Options */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* PDF Report Card */}
          <Card className="opacity-0 animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>PDF Report</CardTitle>
                  <CardDescription>Comprehensive carbon footprint report</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Excel Export Card */}
          <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Excel Export</CardTitle>
                  <CardDescription>Raw data for further analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={handleDownloadExcel}
                disabled={isGeneratingExcel}
                className="w-full"
              >
                {isGeneratingExcel ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reports Archive Table */}
        <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle>Reports Archive</CardTitle>
            <CardDescription>Historically generated reports within your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {reportHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reports generated yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Generated</TableHead>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Generated By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportHistory.map((report: any) => (
                    <TableRow key={report.id}>
                      <TableCell>{format(new Date(report.created_at), "PPp")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {report.report_type === 'PDF' ? (
                            <FileText className="h-4 w-4 text-destructive" />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4 text-success" />
                          )}
                          {report.report_type} Report
                        </div>
                      </TableCell>
                      <TableCell>{new Date(report.date_range_start).getFullYear()}</TableCell>
                      <TableCell>{report.generated_by}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
