
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { File, Upload, FileText, X, Sun, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { validateProposalFile, validateUtilityBillFile } from '@/lib/validation';
import type { ProposalFile, UtilityBillFile } from '@/lib/types';

const FileUpload = () => {
  const navigate = useNavigate();
  const [proposalFile, setProposalFile] = useState<ProposalFile | null>(null);
  const [utilityBillFile, setUtilityBillFile] = useState<UtilityBillFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleProposalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateProposalFile(file)) {
      setProposalFile({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
  }, []);

  const handleUtilityBillChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateUtilityBillFile(file)) {
      setUtilityBillFile({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
  }, []);

  const removeProposalFile = useCallback(() => {
    setProposalFile(null);
  }, []);

  const removeUtilityBillFile = useCallback(() => {
    setUtilityBillFile(null);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalFile) {
      toast.error('Please upload a solar proposal.');
      return;
    }
    if (!utilityBillFile) {
      toast.error('Please upload a utility bill.');
      return;
    }

    setIsUploading(true);

    // Simulating upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            navigate('/results');
            toast.success('Analysis completed successfully!');
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  }, [proposalFile, utilityBillFile, navigate]);

  return (
    <div className="container max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales Proposal Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-solar-500" /> 
                Solar Proposal
              </CardTitle>
              <CardDescription>
                Upload your solar sales proposal (PDF only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!proposalFile ? (
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    id="proposal-upload"
                    type="file"
                    className="hidden"
                    onChange={handleProposalChange}
                    accept=".pdf"
                  />
                  <label htmlFor="proposal-upload" className="cursor-pointer flex flex-col items-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="font-medium">Click to upload your proposal</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF (Max 10MB)</p>
                  </label>
                </div>
              ) : (
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <File className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{proposalFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(proposalFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeProposalFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Utility Bill Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-energy-500" /> 
                Utility Bill
              </CardTitle>
              <CardDescription>
                Upload your utility bill (PDF or image)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!utilityBillFile ? (
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    id="utility-upload"
                    type="file"
                    className="hidden"
                    onChange={handleUtilityBillChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="utility-upload" className="cursor-pointer flex flex-col items-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="font-medium">Click to upload your utility bill</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF, JPG, PNG (Max 10MB)</p>
                  </label>
                </div>
              ) : (
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <File className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{utilityBillFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(utilityBillFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeUtilityBillFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          {isUploading ? (
            <div className="space-y-3">
              <div className="h-2 w-full bg-muted rounded overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Analyzing your documents... {uploadProgress}%
              </p>
            </div>
          ) : (
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-solar-600 hover:bg-solar-700"
              disabled={!proposalFile || !utilityBillFile}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload & Analyze Documents
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FileUpload;
