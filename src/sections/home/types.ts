export interface KpiCardItem {
  id: string;
  titleKey: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitleKey?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  valueColor?: string;
  subBadge?: string;
  subBadgeBg?: string;
  subBadgeColor?: string;
}

export interface NeedsAttentionItem {
  id: string;
  count: number;
  circleBg: string;
  circleColor: string;
  titleKey: string;
  descKey: string;
  actionKey: string;
  actionHref: string;
  badgeKey: string;
  badgeColor: string;
  btnBg: string;
  btnColor: string;
  btnHoverBg: string;
}

export interface AcademicStructureData {
  countries: number;
  universities: number;
  colleges: number;
  subjects: number;
  activeCourses: number;
}

export interface CourseBreakdownItem {
  id: string;
  labelKey: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TopCourseItem {
  id: string;
  course_name: string;
  lecturer: string;
  specialty: string;
  students: number;
  rating: number;
  price: number;
  status: boolean;
  last_update: string;
}

export interface LatestUserItem {
  id: string;
  name: string;
  role: 'lecturer' | 'student';
  university: string;
  avatar: string;
  statusText: string;
  isActiveStatus: boolean;
}

export interface RecentActivityItem {
  id: string;
  type: 'submit' | 'approve' | 'register_student' | 'new_lecturer' | 'reject';
  titleAr: string;
  titleEn: string;
  timeAr: string;
  timeEn: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}
