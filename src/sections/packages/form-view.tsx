'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLocale, useTranslations } from 'next-intl';

import { getCourses } from 'src/actions/courses';
import { getCountriesAction } from 'src/actions/countries';
import { createPackage, getPackageById, updatePackage } from 'src/actions/packages';
import { useToast } from 'src/components/toast';
import { useRouter } from 'src/i18n/routing';
import type { CourseDto } from 'src/types/course';
import { CourseStatusEnum } from 'src/types/course';
import type { PackageFormValues } from 'src/types/package';
import type { CountryDto } from 'src/sections/countries/types';

import CoursePickerDialog from './components/course-picker-dialog';
import PackageCoursesCard from './components/package-courses-card';
import PackageImageCard from './components/package-image-card';
import PackageInfoCard from './components/package-info-card';
import PackagePricingCard from './components/package-pricing-card';

const INITIAL_VALUES: PackageFormValues = {
  nameAr: '', nameEn: '', image: null, courseIds: [], discountedPrice: '', isActive: true,
};

export default function PackageFormView({ packageId, readOnly = false }: { packageId?: string; readOnly?: boolean }) {
  const t = useTranslations('Packages.form');
  const locale = useLocale();
  const toast = useToast();
  const router = useRouter();
  const isEdit = Boolean(packageId);
  const [values, setValues] = useState<PackageFormValues>(INITIAL_VALUES);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    const [coursesResponse, countriesResponse, detailsResponse] = await Promise.all([
      getCourses({ IsActive: true, Status: CourseStatusEnum.Accepted, SkipCount: 0, MaxResultCount: 1000 }),
      getCountriesAction({ IsActive: true, SkipCount: 0, MaxResultCount: 1000 }),
      packageId ? getPackageById(packageId) : Promise.resolve(null),
    ]);
    if (coursesResponse.success && coursesResponse.data) setCourses(coursesResponse.data.items || []);
    else toast.error(coursesResponse.error || t('messages.courses_error'));
    if (countriesResponse.success && countriesResponse.data) setCountries(countriesResponse.data.items || []);

    if (detailsResponse) {
      if (detailsResponse.success && detailsResponse.data) {
        const item = detailsResponse.data;
        const detailsCourses: CourseDto[] = (item.courses || []).map((course) => ({
          id: course.courseId,
          title: course.title || '—',
          imageUrl: course.imageUrl || undefined,
          price: course.price,
          instructorId: course.instructorId,
          instructor: { id: course.instructorId, name: course.instructorName },
          specializationId: course.specializationId,
          specialization: { id: course.specializationId, name: course.specializationName || '—' },
          currency: { id: '', name: '', code: item.currencyCode || '', symbol: item.currencySymbol || '' },
          creationTime: course.addedAt,
        }));
        setCourses((current) => {
          const existingIds = new Set(current.map((course) => course.id));
          return [...current, ...detailsCourses.filter((course) => !existingIds.has(course.id))];
        });
        setValues({
          nameAr: item.nameAr || '',
          nameEn: item.nameEn || '',
          image: item.imageUrl || null,
          courseIds: item.courses?.map((course) => course.courseId) || [],
          discountedPrice: String(item.price ?? ''),
          isActive: item.isActive,
        });
      } else {
        toast.error(detailsResponse.error || t('messages.load_error'));
      }
    }
    setLoading(false);
  }, [packageId, t, toast]);

  useEffect(() => { void loadData(); }, [loadData]);

  const selectedCourses = useMemo(
    () => values.courseIds.map((id) => courses.find((course) => course.id === id)).filter((course): course is CourseDto => Boolean(course)),
    [courses, values.courseIds]
  );
  const coursesTotal = selectedCourses.reduce((sum, course) => sum + Number(course.price || 0), 0);
  const currency = selectedCourses[0]?.currency?.symbol || selectedCourses[0]?.currency?.code || '';

  const validate = () => {
    const next: Record<string, string> = {};
    if (!values.nameAr.trim()) next.nameAr = t('validation.required');
    if (!values.nameEn.trim()) next.nameEn = t('validation.required');
    if (!isEdit && !(values.image instanceof File)) next.image = t('validation.image_required');
    if (!values.courseIds.length) next.courseIds = t('validation.courses_required');
    if (!values.discountedPrice || Number(values.discountedPrice) < 0) next.discountedPrice = t('validation.valid_price');
    if (Number(values.discountedPrice) > coursesTotal) next.discountedPrice = t('validation.discounted_price');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const formData = new FormData();
    formData.append('NameAr', values.nameAr.trim());
    formData.append('NameEn', values.nameEn.trim());
    if (values.image instanceof File) formData.append('Image', values.image);
    values.courseIds.forEach((id) => formData.append('CourseIds', id));
    formData.append('Price', String(coursesTotal));
    formData.append('DiscountedPrice', values.discountedPrice);
    formData.append('IsActive', String(values.isActive));

    setSaving(true);
    const response = packageId ? await updatePackage(packageId, formData) : await createPackage(formData);
    setSaving(false);
    if (!response.success) {
      toast.error(response.error || t('messages.save_error'));
      return;
    }
    toast.success(t(isEdit ? 'messages.update_success' : 'messages.create_success'));
    router.push('/packages');
  };

  if (loading) return <Stack minHeight={400} alignItems="center" justifyContent="center"><CircularProgress /></Stack>;

  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4">{t(readOnly ? 'view_title' : isEdit ? 'edit_title' : 'create_title')}</Typography>
        <Typography color="text.secondary">{t('subtitle')}</Typography>
      </Stack>
      <PackageInfoCard nameAr={values.nameAr} nameEn={values.nameEn} errors={errors} readOnly={readOnly} onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))} />
      <PackageImageCard value={values.image} error={errors.image} readOnly={readOnly} onChange={(image) => setValues((current) => ({ ...current, image }))} />
      <PackageCoursesCard courses={selectedCourses} readOnly={readOnly} onAdd={() => setPickerOpen(true)} onRemove={(id) => setValues((current) => ({ ...current, courseIds: current.courseIds.filter((courseId) => courseId !== id) }))} />
      {errors.courseIds && <Typography color="error" variant="caption">{errors.courseIds}</Typography>}
      <PackagePricingCard coursesTotal={coursesTotal} selectedCount={selectedCourses.length} finalPrice={values.discountedPrice} isActive={values.isActive} currency={currency} errors={errors} readOnly={readOnly} onFinalPriceChange={(discountedPrice) => setValues((current) => ({ ...current, discountedPrice }))} onActiveChange={(isActive) => setValues((current) => ({ ...current, isActive }))} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Button variant="outlined" color="inherit" onClick={() => router.push('/packages')}>{t(readOnly ? 'back' : 'cancel')}</Button>
        {!readOnly && <Button variant="contained" disabled={saving} onClick={handleSubmit}>{saving ? <CircularProgress size={20} color="inherit" /> : t(isEdit ? 'save_changes' : 'create')}</Button>}
      </Box>
      {!readOnly && <CoursePickerDialog open={pickerOpen} courses={courses} selectedIds={values.courseIds} countries={countries.map((country) => ({ id: country.id, name: (locale === 'ar' ? country.nameAr : country.nameEn) || country.nameAr || country.nameEn, currencyId: country.currencyId }))} onClose={() => setPickerOpen(false)} onConfirm={(courseIds) => setValues((current) => ({ ...current, courseIds }))} />}
    </Stack>
  );
}
