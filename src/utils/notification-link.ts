import type { NotificationReferenceType } from 'src/types/firebase-notification';

type Linkable = {
  referenceType?: NotificationReferenceType | string | null;
  referenceId?: string | null;
};

/** The dashboard page a notification opens, per role — null when it isn't about anything specific. */
export function getNotificationHref(item: Linkable, isInstructor: boolean): string | null {
  const id = item.referenceId;
  if (!id || !item.referenceType) return null;
  switch (item.referenceType) {
    case 'SessionRequest':
      return isInstructor ? `/private-requests/${id}` : `/session-requests/${id}`;
    case 'Course':
      return `/courses/${id}`;
    case 'Order':
      return isInstructor ? null : '/orders';
    case 'WalletChargeRequest':
      return isInstructor ? null : `/hours-charge-requests/${id}`;
    default:
      return null;
  }
}
