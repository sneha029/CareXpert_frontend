import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Tag,
  Power,
  PowerOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
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
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useAuthStore } from "@/store/authstore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import axios from "axios";
import { logger } from "@/lib/logger";
import EmptyState from "@/components/EmptyState";
import { PrescriptionTemplate } from "@/types";

type TemplateApiResponse = {
  statusCode: number;
  message: string;
  success: boolean;
  data: PrescriptionTemplate[];
};

type SingleTemplateApiResponse = {
  statusCode: number;
  message: string;
  success: boolean;
  data: PrescriptionTemplate;
};

type TagsApiResponse = {
  statusCode: number;
  message: string;
  success: boolean;
  data: string[];
};

export default function PrescriptionTemplatesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<
    PrescriptionTemplate[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PrescriptionTemplate | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    prescriptionText: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!user || user.role !== "DOCTOR") {
      navigate("/auth/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === "DOCTOR") {
      fetchTemplates();
      fetchTags();
    }
  }, [user]);

  // memoize filter logic and depend solely on callback
  const filterTemplates = useCallback(() => {
    let filtered = [...templates];

    // Filter by active status
    if (showActiveOnly) {
      filtered = filtered.filter((t) => t.isActive);
    }

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
  }, [templates, searchQuery, selectedTag, showActiveOnly]);

  useEffect(() => {
    filterTemplates();
  }, [filterTemplates]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<TemplateApiResponse>(
        "/doctor/prescription-templates",
        { withCredentials: true }
      );
      if (res.data.success) {
        setTemplates(res.data.data);
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
      const res = await api.get<TagsApiResponse>(
        "/doctor/prescription-templates/tags",
        { withCredentials: true }
      );
      if (res.data.success) {
        setAvailableTags(res.data.data);
      }
    } catch (err) {
      logger.error("Failed to fetch tags:", err);
    }
  };


  const handleCreateTemplate = async () => {
    if (!formData.name.trim() || !formData.prescriptionText.trim()) {
      toast.error("Name and prescription text are required");
      return;
    }

    try {
      const res = await api.post<SingleTemplateApiResponse>(
        "/doctor/prescription-templates",
        formData,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Template created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchTemplates();
        fetchTags();
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(
          err.response.data?.message || "Failed to create template"
        );
      } else {
        toast.error("Failed to create template");
      }
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate || !formData.name.trim() || !formData.prescriptionText.trim()) {
      toast.error("Name and prescription text are required");
      return;
    }

    try {
      const res = await api.put<SingleTemplateApiResponse>(
        `/doctor/prescription-templates/${selectedTemplate.id}`,
        formData,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Template updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        fetchTemplates();
        fetchTags();
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(
          err.response.data?.message || "Failed to update template"
        );
      } else {
        toast.error("Failed to update template");
      }
    }
  };

  const handleDeleteTemplate = async (permanent: boolean = false) => {
    if (!selectedTemplate) return;

    try {
      await api.delete(
        `/doctor/prescription-templates/${selectedTemplate.id}${
          permanent ? "?permanent=true" : ""
        }`,
        { withCredentials: true }
      );
      toast.success(
        permanent
          ? "Template deleted permanently"
          : "Template deactivated successfully"
      );
      setIsDeleteDialogOpen(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(
          err.response.data?.message || "Failed to delete template"
        );
      } else {
        toast.error("Failed to delete template");
      }
    }
  };

  const handleToggleActive = async (template: PrescriptionTemplate) => {
    try {
      await api.put(
        `/doctor/prescription-templates/${template.id}`,
        { isActive: !template.isActive },
        { withCredentials: true }
      );
      toast.success(
        template.isActive
          ? "Template deactivated"
          : "Template activated"
      );
      fetchTemplates();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(
          err.response.data?.message || "Failed to update template"
        );
      } else {
        toast.error("Failed to update template");
      }
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (template: PrescriptionTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      prescriptionText: template.prescriptionText,
      tags: template.tags,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (template: PrescriptionTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      prescriptionText: "",
      tags: [],
    });
    setTagInput("");
    setSelectedTemplate(null);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const duplicateTemplate = (template: PrescriptionTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description || "",
      prescriptionText: template.prescriptionText,
      tags: template.tags,
    });
    setIsCreateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Prescription Templates
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Create and manage reusable prescription templates
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
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
            <SelectTrigger className="w-full md:w-[200px]">
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

          {/* Active Filter */}
          <Button
            variant={showActiveOnly ? "default" : "outline"}
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className="gap-2"
          >
            {showActiveOnly ? (
              <>
                <Power className="h-4 w-4" />
                Active Only
              </>
            ) : (
              <>
                <PowerOff className="h-4 w-4" />
                Show All
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredTemplates.length} Templates
          </Badge>
          {selectedTag !== "all" && (
            <Badge variant="outline" className="gap-1">
              <Tag className="h-3 w-3" />
              {selectedTag}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Templates Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredTemplates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg truncate">
                            {template.name}
                          </CardTitle>
                          {template.description && (
                            <CardDescription className="line-clamp-2">
                              {template.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={template.isActive ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Tags */}
                    {template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Preview */}
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {template.prescriptionText}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(template)}
                        className="gap-1 flex-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => duplicateTemplate(template)}
                        className="gap-1 flex-1"
                      >
                        <Copy className="h-3 w-3" />
                        Duplicate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(template)}
                        className="gap-1"
                      >
                        {template.isActive ? (
                          <PowerOff className="h-3 w-3" />
                        ) : (
                          <Power className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(template)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No templates found"
            description={
              searchQuery || selectedTag !== "all"
                ? "Try adjusting your filters"
                : "Create your first prescription template to get started"
            }
            ctaLabel="Create Template"
            onCtaClick={openCreateDialog}
          />
        )}
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Update your prescription template"
                : "Create a new prescription template for reuse"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Type 2 Diabetes Management"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe when to use this template..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* Prescription Text */}
            <div>
              <Label htmlFor="prescriptionText">Prescription Text *</Label>
              <Textarea
                id="prescriptionText"
                placeholder="Enter the prescription details..."
                value={formData.prescriptionText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prescriptionText: e.target.value,
                  })
                }
                rows={8}
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  placeholder="Add a tag (e.g., diabetes, hypertension)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <span className="ml-1 text-xs">×</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                isEditDialogOpen ? handleUpdateTemplate : handleCreateTemplate
              }
            >
              {isEditDialogOpen ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              What would you like to do with this template?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Template:</strong> {selectedTemplate?.name}
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleDeleteTemplate(false)}
              >
                Deactivate (Keep for reference)
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleDeleteTemplate(true)}
              >
                Delete Permanently
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedTemplate(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
