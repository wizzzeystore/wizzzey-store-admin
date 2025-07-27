"use client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X, RefreshCw, Upload, Trash2, AlertTriangle } from "lucide-react";
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
  uploadFooterImage,
  deleteStoreLogo,
  deleteHeroImage,
  deleteFooterImage,
  uploadHeroImageMobile,
  uploadFooterImageMobile
} from "@/lib/apiService";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  defaultStoreEmail: z.string().email("Invalid email address"),
  maintenanceMode: z.boolean(),
  darkMode: z.boolean(),
  themeAccentColor: z.string().optional(),
  storeLogoUrl: z.string().optional(),
  footerText: z.object({
    title: z.string().min(1, "Footer title is required"),
    description: z.string().min(1, "Footer description is required"),
    buttonText: z.string().min(1, "Button text is required"),
    buttonLink: z.string().min(1, "Button link is required"),
  }).optional(),
  announcementBar: z.object({
    enabled: z.boolean(),
    text: z.string().min(1, "Announcement text is required"),
    backgroundColor: z.string().min(1, "Background color is required"),
    textColor: z.string().min(1, "Text color is required"),
  }).optional(),
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
  const [isUploadingFooter, setIsUploadingFooter] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const [isDeletingHero, setIsDeletingHero] = useState(false);
  const [isDeletingFooter, setIsDeletingFooter] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<string>("");
  const [apiKeyLastGenerated, setApiKeyLastGenerated] = useState<string>("");
  const [currentSettings, setCurrentSettings] = useState<AppSettings | null>(null);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
  const [pendingMaintenanceMode, setPendingMaintenanceMode] = useState(false);

  // Add state for uploading mobile images
  const [isUploadingHeroMobile, setIsUploadingHeroMobile] = useState(false);
  const [isUploadingFooterMobile, setIsUploadingFooterMobile] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: "",
      defaultStoreEmail: "",
      maintenanceMode: false,
      darkMode: false,
      themeAccentColor: "#4B0082",
      storeLogoUrl: "",
      footerText: {
        title: "",
        description: "",
        buttonText: "",
        buttonLink: "",
      },
      announcementBar: {
        enabled: true,
        text: "ADDITIONAL 10% OFF ON PREPAID ORDERS",
        backgroundColor: "#000000",
        textColor: "#ffffff",
      },
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
            footerText: settings.footerText,
            announcementBar: settings.announcementBar,
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
        footerText: data.footerText,
        announcementBar: data.announcementBar,
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

  const handleHeroMobileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      toast({ title: "Validation Error", description: validationError, variant: "destructive" });
      return;
    }
    setIsUploadingHeroMobile(true);
    try {
      const response = await uploadHeroImageMobile(file);
      if (response.type === "OK" && response.data) {
        setCurrentSettings(prev => prev ? { ...prev, heroImageMobile: response.data.heroImageMobile } : null);
        toast({ title: "Success", description: "Mobile hero image uploaded successfully." });
      } else {
        toast({ title: "Error", description: response.message || "Failed to upload mobile hero image.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while uploading mobile hero image.", variant: "destructive" });
    } finally {
      setIsUploadingHeroMobile(false);
    }
  };

  const handleFooterUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingFooter(true);
    try {
      const response = await uploadFooterImage(file);
      if (response.type === "OK" && response.data) {
        setCurrentSettings(prev => prev ? { ...prev, footerImage: response.data.footerImage } : null);
        toast({
          title: "Success",
          description: "Footer image uploaded successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to upload footer image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while uploading footer image.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFooter(false);
    }
  };

  const handleFooterMobileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      toast({ title: "Validation Error", description: validationError, variant: "destructive" });
      return;
    }
    setIsUploadingFooterMobile(true);
    try {
      const response = await uploadFooterImageMobile(file);
      if (response.type === "OK" && response.data) {
        setCurrentSettings(prev => prev ? { ...prev, footerImageMobile: response.data.footerImageMobile } : null);
        toast({ title: "Success", description: "Mobile footer image uploaded successfully." });
      } else {
        toast({ title: "Error", description: response.message || "Failed to upload mobile footer image.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while uploading mobile footer image.", variant: "destructive" });
    } finally {
      setIsUploadingFooterMobile(false);
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

  const handleDeleteFooter = async () => {
    setIsDeletingFooter(true);
    try {
      const response = await deleteFooterImage();
      if (response.type === "OK") {
        setCurrentSettings(prev => prev ? { ...prev, footerImage: undefined } : null);
        toast({
          title: "Success",
          description: "Footer image deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete footer image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting footer image.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingFooter(false);
    }
  };

  const handleMaintenanceModeChange = (enabled: boolean) => {
    if (enabled) {
      setPendingMaintenanceMode(true);
      setShowMaintenanceConfirm(true);
    } else {
      form.setValue('maintenanceMode', false);
    }
  };

  const confirmMaintenanceMode = () => {
    form.setValue('maintenanceMode', true);
    setShowMaintenanceConfirm(false);
    setPendingMaintenanceMode(false);
    toast({
      title: "Maintenance Mode Enabled",
      description: "Your web store is now in maintenance mode and inaccessible to customers.",
      variant: "destructive",
    });
  };

  const cancelMaintenanceMode = () => {
    setShowMaintenanceConfirm(false);
    setPendingMaintenanceMode(false);
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
              <CardTitle>Announcement Bar</CardTitle>
              <CardDescription>
                Configure the animated announcement text that appears at the top of your web store.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="announcementBar.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Announcement Bar</FormLabel>
                      <FormDescription>
                        Show or hide the announcement bar on your web store.
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
                name="announcementBar.text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Announcement Text</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ADDITIONAL 10% OFF ON PREPAID ORDERS" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The text that will be displayed in the animated announcement bar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="announcementBar.backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="color"
                            {...field} 
                            className="w-16 h-10 p-1"
                          />
                          <Input 
                            placeholder="#000000" 
                            {...field} 
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Background color for the announcement bar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="announcementBar.textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Color</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="color"
                            {...field} 
                            className="w-16 h-10 p-1"
                          />
                          <Input 
                            placeholder="#ffffff" 
                            {...field} 
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Text color for the announcement bar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <FormLabel>Preview</FormLabel>
                <div 
                  className="p-2 rounded border overflow-hidden"
                  style={{
                    backgroundColor: form.watch('announcementBar.backgroundColor') || '#000000',
                    color: form.watch('announcementBar.textColor') || '#ffffff'
                  }}
                >
                  <div className="animate-marquee whitespace-nowrap">
                    <span className="text-sm font-medium inline-block">
                      {form.watch('announcementBar.text') || 'ADDITIONAL 10% OFF ON PREPAID ORDERS'}
                    </span>
                  </div>
                </div>
              </div>
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
                      src={`${process.env.NEXT_PUBLIC_API_URL}${currentSettings.storeLogo.url}`}
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
              <CardTitle>Hero Section Images</CardTitle>
              <CardDescription>
                Upload separate images for desktop and mobile hero sections.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Desktop Hero Image */}
                <div>
                  <FormLabel>Desktop Hero Image</FormLabel>
                  <div className="flex items-center gap-4 mt-2">
                    {currentSettings?.heroImage?.url && (
                      <Image src={`${process.env.NEXT_PUBLIC_API_URL}${currentSettings.heroImage.url}`} alt="Desktop Hero" width={180} height={100} className="rounded border" />
                    )}
                    <Input type="file" accept="image/*" onChange={handleHeroUpload} disabled={isUploadingHero} />
                    {isUploadingHero && <Loader2 className="animate-spin ml-2" />}
                  </div>
                </div>
                {/* Mobile Hero Image */}
                <div>
                  <FormLabel>Mobile Hero Image</FormLabel>
                  <div className="flex items-center gap-4 mt-2">
                    {currentSettings?.heroImageMobile?.url && (
                      <Image src={`${process.env.NEXT_PUBLIC_API_URL}${currentSettings.heroImageMobile.url}`} alt="Mobile Hero" width={100} height={100} className="rounded border" />
                    )}
                    <Input type="file" accept="image/*" onChange={handleHeroMobileUpload} disabled={isUploadingHeroMobile} />
                    {isUploadingHeroMobile && <Loader2 className="animate-spin ml-2" />}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Footer Section Images</CardTitle>
              <CardDescription>
                Upload separate images for desktop and mobile footer sections.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Desktop Footer Image */}
                <div>
                  <FormLabel>Desktop Footer Image</FormLabel>
                  <div className="flex items-center gap-4 mt-2">
                    {currentSettings?.footerImage?.url && (
                      <Image src={`${process.env.NEXT_PUBLIC_API_URL}${currentSettings.footerImage.url}`} alt="Desktop Footer" width={180} height={100} className="rounded border" />
                    )}
                    <Input type="file" accept="image/*" onChange={handleFooterUpload} disabled={isUploadingFooter} />
                    {isUploadingFooter && <Loader2 className="animate-spin ml-2" />}
                  </div>
                </div>
                {/* Mobile Footer Image */}
                <div>
                  <FormLabel>Mobile Footer Image</FormLabel>
                  <div className="flex items-center gap-4 mt-2">
                    {currentSettings?.footerImageMobile?.url && (
                      <Image src={`${process.env.NEXT_PUBLIC_API_URL}${currentSettings.footerImageMobile.url}`} alt="Mobile Footer" width={100} height={100} className="rounded border" />
                    )}
                    <Input type="file" accept="image/*" onChange={handleFooterMobileUpload} disabled={isUploadingFooterMobile} />
                    {isUploadingFooterMobile && <Loader2 className="animate-spin ml-2" />}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Text Fields */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-lg font-semibold">Footer Text Content</h4>
            <p className="text-sm text-muted-foreground">
              Customize the text that appears over the footer image on your homepage.
            </p>
            
            <FormField
              control={form.control}
              name="footerText.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Fresh Styles Just In!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="footerText.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Don't miss out on our newest arrivals. Update your wardrobe with the latest looks."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="footerText.buttonText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Explore New Arrivals" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="footerText.buttonLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Link</FormLabel>
                    <FormControl>
                      <Input placeholder="/shop?sortBy=createdAt&sortOrder=desc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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
                  <FormItem>
                    <div className="rounded-lg border p-4 bg-orange-50 border-orange-200">
                      <div className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-semibold text-orange-900">Maintenance Mode</FormLabel>
                          <FormDescription className="text-orange-700">
                            When enabled, the entire web store will be inaccessible to customers and show a maintenance page.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={handleMaintenanceModeChange}
                            className="data-[state=checked]:bg-orange-600"
                          />
                        </FormControl>
                      </div>
                      {field.value && (
                        <Alert className="mt-4 border-orange-300 bg-orange-100">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-800 font-medium">
                            ⚠️ Maintenance mode is currently ENABLED. Your web store is now inaccessible to customers.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
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
      <ConfirmationDialog
        isOpen={showMaintenanceConfirm}
        onClose={cancelMaintenanceMode}
        onConfirm={confirmMaintenanceMode}
        title="Enable Maintenance Mode"
        description="Are you sure you want to enable maintenance mode? This will make your web store inaccessible to customers and show a maintenance page instead."
        confirmButtonText="Enable Maintenance Mode"
        confirmButtonVariant="destructive"
      />
    </>
  );
}
