"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCleanupStatus, getOrphanedFilesPreview } from '@/lib/apiService';
import Link from 'next/link';

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

export default function CleanupStatusWidget() {
  const [status, setStatus] = useState<CleanupStatus | null>(null);
  const [preview, setPreview] = useState<OrphanedFilesPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await getCleanupStatus();
      if (response.type === 'OK' && response.data) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching cleanup status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    try {
      const response = await getOrphanedFilesPreview();
      if (response.type === 'OK' && response.data) {
        setPreview(response.data);
      }
    } catch (error) {
      console.error('Error fetching orphaned files preview:', error);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            File Cleanup Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            File Cleanup Status
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStatus}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <div className="space-y-3">
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

            {preview && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Orphaned Files:</span>
                  <Badge variant={preview.orphanedFiles > 0 ? "destructive" : "default"}>
                    {preview.orphanedFiles}
                  </Badge>
                </div>
                
                {preview.orphanedFiles > 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {preview.orphanedFiles} orphaned files found. 
                      <Link href="/cleanup" className="text-primary hover:underline ml-1">
                        Review and clean up →
                      </Link>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No orphaned files found. All files are properly referenced.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t">
          <Link href="/cleanup">
            <Button variant="outline" size="sm" className="w-full">
              Manage Cleanup
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 