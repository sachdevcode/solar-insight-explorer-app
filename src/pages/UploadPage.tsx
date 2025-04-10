
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FileUpload from '@/components/upload/FileUpload';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const UploadPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
          <div className="mb-8">
            <Link to="/" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
            </Link>
            <h1 className="text-3xl font-bold mb-4">Upload Your Documents</h1>
            <p className="text-muted-foreground max-w-2xl">
              Upload your solar proposal and utility bill to get a comprehensive analysis of your 
              solar system performance and potential savings.
            </p>
          </div>
          <FileUpload />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UploadPage;
