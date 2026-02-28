// src/components/health-metrics/AddHealthMetricModal.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useHealthMetricsStore } from "@/store/healthMetricsStore";

interface AddHealthMetricModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  metricType?: string;
}

const METRIC_TYPES = [
  { value: "WEIGHT", label: "Weight", unit: "kg" },
  { value: "HEIGHT", label: "Height", unit: "cm" },
  { value: "BLOOD_PRESSURE_SYSTOLIC", label: "Blood Pressure (Systolic)", unit: "mmHg" },
  { value: "BLOOD_PRESSURE_DIASTOLIC", label: "Blood Pressure (Diastolic)", unit: "mmHg" },
  { value: "BLOOD_GLUCOSE_FASTING", label: "Blood Glucose (Fasting)", unit: "mg/dL" },
  { value: "BLOOD_GLUCOSE_RANDOM", label: "Blood Glucose (Random)", unit: "mg/dL" },
  { value: "BLOOD_GLUCOSE_POST_MEAL", label: "Blood Glucose (Post-Meal)", unit: "mg/dL" },
  { value: "TEMPERATURE", label: "Body Temperature", unit: "°C" },
  { value: "OXYGEN_SATURATION", label: "Oxygen Saturation", unit: "%" },
  { value: "HEART_RATE", label: "Heart Rate", unit: "bpm" },
  { value: "RESPIRATORY_RATE", label: "Respiratory Rate", unit: "breaths/min" },
  { value: "CHOLESTEROL_TOTAL", label: "Total Cholesterol", unit: "mg/dL" },
  { value: "CHOLESTEROL_LDL", label: "LDL Cholesterol", unit: "mg/dL" },
  { value: "CHOLESTEROL_HDL", label: "HDL Cholesterol", unit: "mg/dL" },
  { value: "TRIGLYCERIDES", label: "Triglycerides", unit: "mg/dL" },
  { value: "HBA1C", label: "HbA1c", unit: "%" },
];

const formSchema = z.object({
  metricType: z.string().min(1, "Please select a metric type"),
  value: z.coerce.number().positive("Value must be positive"),
  notes: z.string().optional(),
  recordedAt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddHealthMetricModal({
  open,
  onClose,
  patientId,
  metricType,
}: AddHealthMetricModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addMetric } = useHealthMetricsStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metricType: metricType || "",
      value: 0,
      notes: "",
      recordedAt: new Date().toISOString().slice(0, 16),
    },
  });

  const selectedMetricType = form.watch("metricType");
  const selectedMetric = METRIC_TYPES.find(m => m.value === selectedMetricType);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await addMetric(patientId, {
        metricType: data.metricType,
        value: data.value,
        unit: selectedMetric?.unit || "",
        notes: data.notes,
        recordedAt: data.recordedAt,
      });
      form.reset();
      onClose();
    } catch (error) {
      // Error is handled in the store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Health Metric</DialogTitle>
          <DialogDescription>
            Record a new health measurement for this patient.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="metricType"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Metric Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {METRIC_TYPES.map((metric) => (
                        <SelectItem key={metric.value} value={metric.value}>
                          {metric.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>
                    Value {selectedMetric && `(${selectedMetric.unit})`}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter value"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recordedAt"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Metric"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
