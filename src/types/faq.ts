export type FaqItem = {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  creationTime: string;
  lastModificationTime: string | null;
};

export type FaqListResponse = {
  totalCount: number;
  items: FaqItem[];
};

export type CreateFaqPayload = {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
};

export type UpdateFaqPayload = CreateFaqPayload;
