export type SessionGroupDiscountSetting = {
  isEnabled: boolean;
  minParticipants: number;
  discountPercentage: number;
};

export type UpdateSessionGroupDiscountSettingPayload = SessionGroupDiscountSetting;
