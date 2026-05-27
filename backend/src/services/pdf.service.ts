export interface PdfPlaceholderResponse {
  assignmentId: string;
  message: string;
  available: boolean;
}

export const getPdfPlaceholderResponse = (assignmentId: string): PdfPlaceholderResponse => {
  return {
    assignmentId,
    message: 'PDF generation is not implemented yet. This endpoint is reserved for the final PDF output.',
    available: false,
  };
};