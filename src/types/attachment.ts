export interface AttachmentDto {
  id: string;
  name: string;
  url: string;
  type?: string | number;
  lessonCount?: number;
  creationTime?: string;
}