"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Category } from "@/types/ecommerce";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createCategory, updateCategory, getCategories as fetchParentCategories } from "@/lib/apiService";
import React, { useEffect, useState } from "react";
import { Loader2, Upload, Trash2 } from "lucide-react";
import Image from "next/image";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and hyphen-separated."),
  icon: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.coerce.number().int().optional().default(0),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: Category | null;
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ? {
        ...initialData,
        parentId: initialData.parentId || null, // Ensure null if undefined
        imageUrl: initialData.imageUrl || "",
        isActive: initialData.isActive ?? true,
        displayOrder: initialData.displayOrder || 0,
    } : {
      name: "",
      description: "",
      parentId: null,
      imageUrl: "",
      slug: "",
      icon: "",
      isActive: true,
      displayOrder: 0,
    },
  });

  // File validation function
  const validateImageFile = (file: File): string | null => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only PNG and JPEG images are allowed';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  // Handle image file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (initialData?.image) {
      // Mark for deletion
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    async function loadParentCategories() {
      try {
        const response = await fetchParentCategories(1, 100, { showAll: true }); // Fetch all potential parent categories
        if (response.type === "OK" && response.data?.categories) {
          // Filter out the current category if editing, to prevent self-parenting
          setParentCategories(
            initialData 
            ? response.data.categories.filter(cat => cat.id !== initialData.id) 
            : response.data.categories
          );
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load parent categories.", variant: "destructive" });
      }
    }
    loadParentCategories();
  }, [toast, initialData]);

  const onSubmit = async (values: CategoryFormValues) => {
    setIsLoading(true);
    // Ensure parentId is string or undefined, not null for API
    const apiValues = { ...values, parentId: values.parentId === null ? undefined : values.parentId };

    try {
      let response;
      
      if (selectedImage) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('files', selectedImage);
        
        // Add other form data
        Object.keys(apiValues).forEach(key => {
          if (apiValues[key] !== undefined && apiValues[key] !== null) {
            formData.append(key, apiValues[key]);
          }
        });

        if (initialData) {
          response = await updateCategory(initialData.id, formData);
        } else {
          response = await createCategory(formData);
        }
      } else {
        // No file upload, use regular JSON
        if (initialData) {
          response = await updateCategory(initialData.id, apiValues);
        } else {
          response = await createCategory(apiValues as Omit<Category, 'id' | 'createdAt' | 'updatedAt'>);
        }
      }

      if (response.type === "OK") {
        toast({ title: "Success", description: `Category ${initialData ? 'updated' : 'created'} successfully.` });
        router.push("/categories");
        router.refresh();
      } else {
        toast({ title: "Error", description: response.message || "An error occurred.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl><Input placeholder="e.g., Electronics" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl><Textarea placeholder="Brief description of the category" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category (Optional)</FormLabel>
              <Select onValueChange={(value) => field.onChange(value === "null" ? null : value)} defaultValue={field.value || "null"}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a parent category" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  {parentCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Category Image Upload Section */}
        <div className="space-y-4">
          <FormLabel>Category Image</FormLabel>
          <Alert>
            <AlertDescription>
              <strong>Upload Requirements:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Only PNG and JPEG images are allowed</li>
                <li>Maximum file size: 5MB</li>
                <li>Recommended dimensions: 300x200px or similar aspect ratio</li>
                <li>PNG format recommended for transparency</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Current Image Display */}
          {(initialData?.image || imagePreview) && (
            <div className="space-y-4">
              <div className="relative inline-block">
                <Image
                  src={imagePreview || initialData?.image?.url || ""}
                  alt="Category Image"
                  width={300}
                  height={200}
                  className="rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2"
                  onClick={handleRemoveImage}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {initialData?.image && !imagePreview && (
                <div className="text-sm text-muted-foreground">
                  <p>Current image: {initialData.image.originalName}</p>
                  <p>Size: {(initialData.image.size / 1024).toFixed(1)} KB</p>
                </div>
              )}
            </div>
          )}

          {/* Upload Area */}
          {!imagePreview && !initialData?.image && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No image uploaded</p>
            </div>
          )}

          {/* File Input */}
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImageChange}
              disabled={isUploading}
              className="flex-1"
            />
            {isUploading && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        </div>

         <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl><Input placeholder="auto-generated if empty" {...field} /></FormControl>
              <FormDescription>URL-friendly version of the name. Auto-generated if left blank.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>Is this category currently active and visible?</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order (Optional)</FormLabel>
              <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
              <FormDescription>Order in which category appears (lower numbers first).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/categories')} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Category')}</Button>
        </div>
      </form>
    </Form>
  );
}
