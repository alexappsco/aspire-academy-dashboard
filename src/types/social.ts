export interface SocialItem {
  id: string;
  name: string;
  icon: string;
  url: string;
}

export interface CreateSocialPayload {
  name: string;
  icon: string;
  url: string;
}

export interface UpdateSocialPayload {
  name: string;
  icon: string;
  url: string;
}
