"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trash2, 
  Play, 
  Pause, 
  RefreshCw, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getCleanupStatus, 
  getOrphanedFilesPreview, 
  triggerManualCleanup, 
  startCleanupScheduler, 
  stopCleanupScheduler 
} from '@/lib/apiService';

interface CleanupStatus {
  isRunning: boolean;
  schedulerActive: boolean;
  lastRun: string | null;
  nextScheduledRun: string;
  uploadsDirectory: string;
}

interface OrphanedFilesPreview {
  totalFilesInUploads: number;
  referencedFiles: number;
  orphanedFiles: number;
  orphanedFileList: string[];
  estimatedSpaceSaved: string;
  timestamp: string;
}

export default function CleanupPage() {
  const [status, setStatus] = useState<CleanupStatus | null>(null);
  const [preview, setPreview] = useState<OrphanedFilesPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { toast } = useToast();

  // Fetch status on component mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await getCleanupStatus();
      if (response.type === 'OK' && response.data) {
        setStatus(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch status');
      }
    } catch (error) {
      console.error('Error fetching cleanup status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cleanup service status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    try {
      setPreviewLoading(true);
      const response = await getOrphanedFilesPreview();
      if (response.type === 'OK' && response.data) {
        setPreview(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch preview');
      }
    } catch (error) {
      console.error('Error fetching orphaned files preview:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orphaned files preview",
        variant: "destructive",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const triggerCleanup = async () => {
    try {
      setLoading(true);
      const response = await triggerManualCleanup();
      if (response.type === 'OK') {
        toast({
          title: "Success",
          description: "Cleanup process has been initiated. Check logs for progress.",
        });
        // Refresh status after a short delay
        setTimeout(() => {
          fetchStatus();
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to trigger cleanup');
      }
    } catch (error) {
      console.error('Error triggering cleanup:', error);
      toast({
        title: "Error",
        description: "Failed to trigger cleanup process",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startScheduler = async () => {
    try {
      setLoading(true);
      const response = await startCleanupScheduler();
      if (response.type === 'OK') {
        toast({
          title: "Success",
          description: "Cleanup scheduler started successfully",
        });
        fetchStatus();
      } else {
        throw new Error(response.message || 'Failed to start scheduler');
      }
    } catch (error) {
      console.error('Error starting scheduler:', error);
      toast({
        title: "Error",
        description: "Failed to start cleanup scheduler",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stopScheduler = async () => {
    try {
      setLoading(true);
      const response = await stopCleanupScheduler();
      if (response.type === 'OK') {
        toast({
          title: "Success",
          description: "Cleanup scheduler stopped successfully",
        });
        fetchStatus();
      } else {
        throw new Error(response.message || 'Failed to stop scheduler');
      }
    } catch (error) {
      console.error('Error stopping scheduler:', error);
      toast({
        title: "Error",
        description: "Failed to stop cleanup scheduler",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">File Cleanup</h1>
        <p className="text-muted-foreground">
          Manage automated cleanup of orphaned image files from the uploads directory.
        </p>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Service Status</TabsTrigger>
          <TabsTrigger value="preview">Orphaned Files Preview</TabsTrigger>
          <TabsTrigger value="actions">Manual Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Cleanup Service Status
              </CardTitle>
              <CardDescription>
                Current status of the automated cleanup service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Service Status:</span>
                      <Badge variant={status.isRunning ? "destructive" : "secondary"}>
                        {status.isRunning ? "Running" : "Idle"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Scheduler:</span>
                      <Badge variant={status.schedulerActive ? "default" : "secondary"}>
                        {status.schedulerActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Next Run:</span>
                      <span className="text-sm text-muted-foreground">
                        {status.nextScheduledRun}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Run:</span>
                      <span className="text-sm text-muted-foreground">
                        {status.lastRun ? new Date(status.lastRun).toLocaleString() : "Never"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Uploads Directory:</span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {status.uploadsDirectory}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              
              <Separator />
              
              <div className="flex gap-2">
                <Button 
                  onClick={fetchStatus} 
                  variant="outline" 
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Orphaned Files Preview
              </CardTitle>
              <CardDescription>
                Preview files that would be deleted without actually removing them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {preview ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{preview.totalFilesInUploads}</div>
                      <div className="text-sm text-muted-foreground">Total Files</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{preview.referencedFiles}</div>
                      <div className="text-sm text-muted-foreground">Referenced Files</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{preview.orphanedFiles}</div>
                      <div className="text-sm text-muted-foreground">Orphaned Files</div>
                    </div>
                  </div>

                  {preview.orphanedFiles > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium">Orphaned Files:</h4>
                      <div className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-muted/50">
                        {preview.orphanedFileList.map((file, index) => (
                          <div key={index} className="text-sm font-mono py-1">
                            {file}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        No orphaned files found. All files in the uploads directory are properly referenced.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(preview.timestamp).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Click "Generate Preview" to see orphaned files
                  </p>
                </div>
              )}

              <Separator />

              <Button 
                onClick={fetchPreview} 
                disabled={previewLoading}
                className="w-full"
              >
                {previewLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Generate Preview
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Manual Actions
              </CardTitle>
              <CardDescription>
                Manually control the cleanup service and scheduler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Manual cleanup will delete orphaned files immediately. Make sure to review the preview first.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Cleanup Actions</h4>
                  <Button 
                    onClick={triggerCleanup} 
                    disabled={loading || status?.isRunning}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Trigger Manual Cleanup
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Scheduler Control</h4>
                  <div className="flex gap-2">
                    <Button 
                      onClick={startScheduler} 
                      disabled={loading || status?.schedulerActive}
                      variant="outline"
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Scheduler
                    </Button>
                    <Button 
                      onClick={stopScheduler} 
                      disabled={loading || !status?.schedulerActive}
                      variant="outline"
                      className="flex-1"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Scheduler
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Note:</strong> The cleanup service runs automatically every day at 12:00 AM IST.</p>
                <p>Manual cleanup is useful for immediate cleanup or testing purposes.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 