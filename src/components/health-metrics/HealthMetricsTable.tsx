// src/components/health-metrics/HealthMetricsTable.tsx
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { useHealthMetricsStore } from "@/store/healthMetricsStore";
import { getMetricStatus } from "@/lib/healthMetricUtils";
import { format } from "date-fns";
import type { MetricFilters, MetricStatus } from "@/types";
import { cn } from "@/lib/utils";

interface HealthMetricsTableProps {
  patientId: string;
  filters?: MetricFilters;
  editable?: boolean;
}

const STATUS_COLORS: Record<MetricStatus, string> = {
  NORMAL: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  ABNORMAL: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function HealthMetricsTable({
  patientId,
  filters: initialFilters,
  editable = false,
}: HealthMetricsTableProps) {
  const { metrics, loading, fetchMetrics, deleteMetric } = useHealthMetricsStore();
  const [filters, setFilters] = useState<MetricFilters>(initialFilters || {
    limit: 10,
    offset: 0,
  });
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'NORMAL' | 'ABNORMAL'>('all');

  useEffect(() => {
    fetchMetrics(patientId, filters);
  }, [patientId, filters, fetchMetrics]);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status as 'all' | 'NORMAL' | 'ABNORMAL');
    setFilters(prev => ({
      ...prev,
      abnormalOnly: status === 'ABNORMAL' ? true : undefined,
      offset: 0,
    }));
    setPage(0);
  };

  const handleDelete = async (metricId: string) => {
    if (window.confirm('Are you sure you want to delete this metric?')) {
      await deleteMetric(patientId, metricId);
    }
  };

  const handleNextPage = () => {
    const newPage = page + 1;
    setPage(newPage);
    setFilters(prev => ({
      ...prev,
      offset: newPage * (prev.limit || 10),
    }));
  };

  const handlePrevPage = () => {
    const newPage = Math.max(0, page - 1);
    setPage(newPage);
    setFilters(prev => ({
      ...prev,
      offset: newPage * (prev.limit || 10),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter metrics on the frontend for NORMAL status
  const filteredMetrics = statusFilter === 'NORMAL'
    ? metrics.filter(m => getMetricStatus(m.metricType, m.value) === 'NORMAL')
    : metrics;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="ABNORMAL">Abnormal / Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredMetrics.length} record{filteredMetrics.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recorded At</TableHead>
              <TableHead>Notes</TableHead>
              {editable && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMetrics.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={editable ? 6 : 5}
                  className="text-center text-muted-foreground"
                >
                  No metrics found
                </TableCell>
              </TableRow>
            ) : (
              filteredMetrics.map((metric) => {
                const status = getMetricStatus(metric.metricType, metric.value);
                return (
                  <TableRow
                    key={metric.id}
                    className={cn(
                      status === 'CRITICAL' && 'bg-red-50 dark:bg-red-950/20',
                      status === 'ABNORMAL' && 'bg-orange-50 dark:bg-orange-950/20'
                    )}
                  >
                    <TableCell className="font-medium">
                      {metric.metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </TableCell>
                    <TableCell>
                      {metric.value} {metric.unit}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={STATUS_COLORS[status]}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(metric.recordedAt), 'PPp')}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {metric.notes || '-'}
                    </TableCell>
                    {editable && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              // TODO: Implement edit functionality
                              console.log('Edit metric:', metric.id);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleDelete(metric.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={page === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page + 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={metrics.length < (filters.limit || 10)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
