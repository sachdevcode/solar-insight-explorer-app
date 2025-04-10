
import { toast } from "sonner";

export const validateProposalFile = (file: File): boolean => {
  // Check if file is PDF
  if (file.type !== "application/pdf") {
    toast.error("Sales proposal must be a PDF file");
    return false;
  }
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    toast.error("Sales proposal file size must be less than 10MB");
    return false;
  }
  
  return true;
};

export const validateUtilityBillFile = (file: File): boolean => {
  // Check if file is PDF or image (JPEG, PNG)
  const validTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (!validTypes.includes(file.type)) {
    toast.error("Utility bill must be a PDF, JPEG, or PNG file");
    return false;
  }
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    toast.error("Utility bill file size must be less than 10MB");
    return false;
  }
  
  return true;
};
