"use client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X, RefreshCw, Upload, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppSettings } from "@/types/ecommerce";
import { 
  getAppSettings, 
  updateAppSettings, 
  generateApiKey,
  uploadStoreLogo,
  uploadHeroImage,
  deleteStoreLogo,
  deleteHeroImage
} from "@/lib/apiService";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  defaultStoreEmail: z.string().email("Invalid email address"),
  maintenanceMode: z.boolean(),
  darkMode: z.boolean(),
  themeAccentColor: z.string().optional(),
  storeLogoUrl: z.string().optional(),
  notifications: z.object({
    newOrderEmails: z.boolean(),
    lowStockAlerts: z.boolean(),
    productUpdatesNewsletter: z.boolean(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isGeneratingApiKey, setIsGeneratingApiKey] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const [isDeletingHero, setIsDeletingHero] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<string>("");
  const [apiKeyLastGenerated, setApiKeyLastGenerated] = useState<string>("");
  const [currentSettings, setCurrentSettings] = useState<AppSettings | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: "",
      defaultStoreEmail: "",
      maintenanceMode: false,
      darkMode: false,
      themeAccentColor: "#4B0082",
      storeLogoUrl: "",
      notifications: {
        newOrderEmails: true,
        lowStockAlerts: true,
        productUpdatesNewsletter: false,
      },
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

  useEffect(() => {
    const fetchSettings = async () => {
      setIsFetching(true);
      try {
        const response = await getAppSettings();
        console.log("Log: Fetched app settings:", response);
        if (response.type === "OK" && response.data) {
          const settings = response.data;
          setCurrentSettings(settings);
          form.reset({
            storeName: settings.storeName,
            defaultStoreEmail: settings.defaultStoreEmail,
            maintenanceMode: settings.maintenanceMode,
            darkMode: settings.darkMode,
            themeAccentColor: settings.themeAccentColor,
            storeLogoUrl: settings.storeLogoUrl,
            notifications: settings.notifications,
          });
          setCurrentApiKey(settings.apiSettings?.apiKey || "");
          setApiKeyLastGenerated(settings.apiSettings?.apiKeyLastGenerated || "");
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load settings.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not fetch app settings.",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, [form, toast]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsLoading(true);
    try {
      const payload: Partial<AppSettings> = {
        storeName: data.storeName,
        defaultStoreEmail: data.defaultStoreEmail,
        maintenanceMode: data.maintenanceMode,
        darkMode: data.darkMode,
        themeAccentColor: data.themeAccentColor,
        storeLogoUrl: data.storeLogoUrl,
        notifications: data.notifications,
      };
      const response = await updateAppSettings(payload);
      if (response.type === "OK") {
        toast({
          title: "Success",
          description: "Settings updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    setIsGeneratingApiKey(true);
    try {
      const response = await generateApiKey();
      if (response.type === "OK" && response.data) {
        setCurrentApiKey(response.data.apiKey);
        setApiKeyLastGenerated(new Date().toISOString());
        toast({
          title: "Success",
          description: "API key generated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to generate API key.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while generating API key.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingApiKey(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingLogo(true);
    try {
      const response = await uploadStoreLogo(file);
      if (response.type === "OK" && response.data) {
        setCurrentSettings(prev => prev ? { ...prev, storeLogo: response.data.storeLogo } : null);
        toast({
          title: "Success",
          description: "Store logo uploaded successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to upload logo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while uploading logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleHeroUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingHero(true);
    try {
      const response = await uploadHeroImage(file);
      if (response.type === "OK" && response.data) {
        setCurrentSettings(prev => prev ? { ...prev, heroImage: response.data.heroImage } : null);
        toast({
          title: "Success",
          description: "Hero image uploaded successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to upload hero image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while uploading hero image.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingHero(false);
    }
  };

  const handleDeleteLogo = async () => {
    setIsDeletingLogo(true);
    try {
      const response = await deleteStoreLogo();
      if (response.type === "OK") {
        setCurrentSettings(prev => prev ? { ...prev, storeLogo: undefined } : null);
        toast({
          title: "Success",
          description: "Store logo deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete logo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting logo.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingLogo(false);
    }
  };

  const handleDeleteHero = async () => {
    setIsDeletingHero(true);
    try {
      const response = await deleteHeroImage();
      if (response.type === "OK") {
        setCurrentSettings(prev => prev ? { ...prev, heroImage: undefined } : null);
        toast({
          title: "Success",
          description: "Hero image deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete hero image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting hero image.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingHero(false);
    }
  };

  if (isFetching) {
    return (
      <>
        <PageHeader
          title="Application Settings"
          description="Configure general settings for your Wizzzey store."
        />
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Application Settings"
        description="Configure general settings for your Wizzzey store."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage basic store information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Wizzzey Store" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultStoreEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="support@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storeLogoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Logo URL (Legacy)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.png"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Legacy field for external logo URL. Use the upload section below for better control.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Store Logo</CardTitle>
              <CardDescription>
                Upload your store logo. PNG format is recommended for transparency support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  <strong>Upload Requirements:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Only PNG and JPEG images are allowed</li>
                    <li>Maximum file size: 5MB</li>
                    <li>PNG format recommended for transparency</li>
                    <li>Recommended dimensions: 200x100px or similar aspect ratio</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {currentSettings?.storeLogo ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <Image
                      src={currentSettings.storeLogo.url}
                      alt="Store Logo"
                      width={200}
                      height={100}
                      className="rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={handleDeleteLogo}
                      disabled={isDeletingLogo}
                    >
                      {isDeletingLogo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Filename: {currentSettings.storeLogo.originalName}</p>
                    <p>Size: {(currentSettings.storeLogo.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">No logo uploaded</p>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                  className="flex-1"
                />
                {isUploadingLogo && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Hero Section Image</CardTitle>
              <CardDescription>
                Upload an image for your homepage hero section. This will be displayed prominently on your store's homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  <strong>Upload Requirements:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Only PNG and JPEG images are allowed</li>
                    <li>Maximum file size: 5MB</li>
                    <li>Recommended dimensions: 1200x600px or similar aspect ratio</li>
                    <li>High-quality images work best for hero sections</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {currentSettings?.heroImage ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <Image
                      src={currentSettings.heroImage.url}
                      alt="Hero Image"
                      width={400}
                      height={200}
                      className="rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={handleDeleteHero}
                      disabled={isDeletingHero}
                    >
                      {isDeletingHero ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Filename: {currentSettings.heroImage.originalName}</p>
                    <p>Size: {(currentSettings.heroImage.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">No hero image uploaded</p>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleHeroUpload}
                  disabled={isUploadingHero}
                  className="flex-1"
                />
                {isUploadingHero && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system behavior and appearance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="maintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Maintenance Mode</FormLabel>
                      <FormDescription>
                        Enable maintenance mode to temporarily disable the store.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="darkMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Dark Mode</FormLabel>
                      <FormDescription>
                        Enable dark mode for the admin interface.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="themeAccentColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Accent Color</FormLabel>
                    <FormControl>
                      <Input placeholder="#4B0082" {...field} />
                    </FormControl>
                    <FormDescription>
                      Primary accent color for the theme (hex format).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure email notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="notifications.newOrderEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">New Order Emails</FormLabel>
                      <FormDescription>
                        Receive email notifications for new orders.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notifications.lowStockAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Low Stock Alerts</FormLabel>
                      <FormDescription>
                        Receive notifications when products are running low on stock.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notifications.productUpdatesNewsletter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Product Updates Newsletter</FormLabel>
                      <FormDescription>
                        Receive newsletters about product updates and new features.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>API Key</CardTitle>
              <CardDescription>
                Use this API key to integrate with external services or for custom development.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormItem>
                <FormLabel>API Key (Read-Only)</FormLabel>
                <FormControl>
                  <Input 
                    value={currentApiKey} 
                    readOnly 
                    placeholder="No API key generated yet"
                  />
                </FormControl>
                <FormDescription>
                  {apiKeyLastGenerated 
                    ? `Last Generated: ${new Date(apiKeyLastGenerated).toLocaleDateString()} ${new Date(apiKeyLastGenerated).toLocaleTimeString()}`
                    : "No API key has been generated yet."
                  }
                </FormDescription>
              </FormItem>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGenerateApiKey}
                disabled={isGeneratingApiKey}
              >
                {isGeneratingApiKey ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate New API Key
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
