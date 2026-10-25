export type SessionGroupDiscountTier = {
  id: string;
  minParticipants: number;
  discountPercentage: number;
};

export type SessionGroupDiscountSetting = {
  isEnabled: boolean;
  tiers: SessionGroupDiscountTier[];
};

export type UpdateSessionGroupDiscountSettingPayload = SessionGroupDiscountSetting;
