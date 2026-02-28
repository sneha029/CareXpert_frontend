import { useState, useEffect } from "react";
import { FileText, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { doctorAPI } from "@/lib/services";
import { toast } from "sonner";
import axios from "axios";
import { PrescriptionTemplate } from "@/types";

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (text: string) => void;
}

export default function TemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<
    PrescriptionTemplate[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PrescriptionTemplate | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchTags();
    }
  }, [isOpen]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedTag]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const res = await doctorAPI.getPrescriptionTemplates({ isActive: true });
      if (res.data.success) {
        setTemplates(res.data.data as PrescriptionTemplate[]);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(
          err.response.data?.message || "Failed to load templates"
        );
      } else {
        toast.error("Failed to load templates");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await doctorAPI.getPrescriptionTemplateTags();
      if (res.data.success) {
        setAvailableTags(res.data.data as string[]);
      }
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter((t) => t.tags.includes(selectedTag));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          (t.description?.toLowerCase().includes(query) ?? false) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleSelectTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate.prescriptionText);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedTag("all");
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Prescription Template</DialogTitle>
          <DialogDescription>
            Choose a template to use as a starting point for your prescription
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tag Filter */}
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {filteredTemplates.length} Templates
            </Badge>
          </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                      {template.description}
                    </p>
                  )}
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    <p className="line-clamp-2 text-gray-700 dark:text-gray-300">
                      {template.prescriptionText}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No templates found</p>
              {(searchQuery || selectedTag !== "all") && (
                <p className="text-sm mt-1">Try adjusting your filters</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSelectTemplate}
            disabled={!selectedTemplate}
          >
            Use Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
