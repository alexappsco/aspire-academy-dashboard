import { cookies } from 'next/headers';
import { COOKIES_KEYS } from 'src/config-global';
import DiscountCodesView from '@/sections/discount-codes/view';
import { InstructorDiscountCodesView } from '@/sections/instructor-coupons';

export default async function DiscountCodesPage() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(COOKIES_KEYS.role)?.value;
  const role = rawRole ? decodeURIComponent(rawRole).trim().toLowerCase() : '';
  const isInstructor = role === 'instructor';

  if (isInstructor) {
    return <InstructorDiscountCodesView />;
  }

  return <DiscountCodesView />;
}
