
export interface UploadedFile {
  name: string;
  mimeType: string;
  data: string; // base64 encoded data URL
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
