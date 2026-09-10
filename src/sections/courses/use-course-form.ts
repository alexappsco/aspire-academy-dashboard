'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'src/i18n/routing';
import { useToast } from 'src/components/toast';

import { getUniversitiesAction } from 'src/actions/unversity';
import { getFaculties, type FacultyDto } from 'src/actions/faculties';
import { getAcademicYears, type AcademicYearDto } from 'src/actions/academic-years';
import { getFields, getSpecializations } from 'src/actions/specializations';
import { getSemesters, type SemesterDto } from 'src/actions/semesters';
import { getCurrenciesAction } from 'src/actions/currencies';
import { getInstructors } from 'src/actions/instructors';
import { getStudyMaterialsAction } from 'src/actions/study-materials';
import { createCourse, updateCourse } from 'src/actions/courses';

import { EMPTY_RICH_CHAPTERS, mapRichToFormChapters } from './sample-curriculum';
import { buildCourseFormData } from './build-course-payload';
import {
  COURSE_TYPE_KEY_MAP,
  mapCurriculumToFormChapters,
} from './edit-course-data';
import type { Chapter, CourseFormValues } from './types';
import type { CourseDto } from 'src/types/course';

export type SelectOption = { id: string; nameAr: string; nameEn: string };
export type InstructorOption = { id: string; name: string };
export type CurrencyOption = { id: string; name: string; symbol: string };

const INITIAL_CHAPTERS: Chapter[] = mapRichToFormChapters(EMPTY_RICH_CHAPTERS);

const initialValues: CourseFormValues = {
  title: '',
  description: '',
  image: null,
  type: '',
  price: '',
  oldPrice: '',
  accessDurationInDays: '',
  currencyId: '',
  specializationId: '',
  facultyId: '',
  studyMaterialId: '',
  instructorId: '',
  fieldId: '',
  universityId: '',
  academicYearId: '',
  semesterId: '',
  learningObjectives: [],
  chapters: INITIAL_CHAPTERS,
};

export function useCourseForm(options: { course?: CourseDto | null } = {}) {
  const { course: initialCourse = null } = options;
  const t = useTranslations('CreateCourse');
  const router = useRouter();
  const toast = useToast();

  const [activeStep, setActiveStep] = useState(1);
  const [formValues, setFormValues] = useState<CourseFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const prefilledCourseRef = useRef<string | null>(null);

  // Independent select data (fetched once on mount)
  const [universities, setUniversities] = useState<SelectOption[]>([]);
  const [fields, setFields] = useState<SelectOption[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearDto[]>([]);

  // Cascaded select data
  const [faculties, setFaculties] = useState<FacultyDto[]>([]);
  const [specializations, setSpecializations] = useState<SelectOption[]>([]);
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<SelectOption[]>([]);

  // Loading flags for cascaded fetches
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingStudyMaterials, setLoadingStudyMaterials] = useState(false);

  // ── Independent fetches ──────────────────────────────────

  useEffect(() => {
    getUniversitiesAction({ IsActive: true, MaxResultCount: 1000 }).then((res) => {
      if (res.success && res.data) setUniversities(res.data.items);
    });
  }, []);

  useEffect(() => {
    getFields({ IsActive: true, MaxResultCount: 1000 }).then((res) => {
      if (res.success && res.data) setFields(res.data.items);
    });
  }, []);

  useEffect(() => {
    getInstructors({ MaxResultCount: 1000 }).then((res) => {
      if (res.success && res.data) setInstructors(res.data.items.map((item) => ({ id: item.id, name: item.name })));
    });
  }, []);

  useEffect(() => {
    getCurrenciesAction({ IsActive: true, MaxResultCount: 1000 }).then((res) => {
      if (res.success && res.data) {
        setCurrencies(res.data.items.map((item) => ({ id: item.id, name: item.nameAr, symbol: item.symbol })));
      }
    });
  }, []);

  useEffect(() => {
    getAcademicYears().then((res) => {
      if (res.success && res.data) setAcademicYears(res.data.items);
    });
  }, []);

  // ── Edit mode: prefill form from an existing course ─────

  useEffect(() => {
    if (!initialCourse) return;
    if (prefilledCourseRef.current === initialCourse.id) return;
    prefilledCourseRef.current = initialCourse.id;

    let cancelled = false;

    (async () => {
      let universityId = '';
      let academicYearId = '';
      let semesterId = '';

      if (initialCourse.facultyId) {
        const facRes = await getFaculties({ IsActive: true, MaxResultCount: 1000 });
        const allFaculties = facRes.success ? facRes.data?.items ?? [] : [];
        const courseFaculty = allFaculties.find((faculty) => faculty.id === initialCourse.facultyId);
        if (!cancelled) {
          setFaculties(
            courseFaculty
              ? allFaculties.filter((faculty) => faculty.universityId === courseFaculty.universityId)
              : []
          );
          setLoadingFaculties(false);
        }
        if (courseFaculty) universityId = courseFaculty.universityId;

        const semRes = await getSemesters({
          FacultyId: initialCourse.facultyId,
          IsActive: true,
          MaxResultCount: 1000,
        });
        const semestersForFaculty = semRes.success ? semRes.data?.items ?? [] : [];
        if (!cancelled) {
          setSemesters(semestersForFaculty);
          setLoadingSemesters(false);
        }

        const smRes = await getStudyMaterialsAction({
          FacultyId: initialCourse.facultyId,
          IsActive: true,
          MaxResultCount: 1000,
        });
        const materialsForFaculty = smRes.success ? smRes.data?.items ?? [] : [];
        if (!cancelled) {
          setStudyMaterials(
            materialsForFaculty.map((item) => ({
              id: item.id,
              nameAr: item.nameAr,
              nameEn: item.nameEn,
            }))
          );
          setLoadingStudyMaterials(false);
        }

        const courseMaterial = materialsForFaculty.find(
          (item) => item.id === initialCourse.studyMaterialId
        );
        if (courseMaterial?.semesterId) {
          semesterId = courseMaterial.semesterId;
          const courseSemester = semestersForFaculty.find((semester) => semester.id === semesterId);
          if (courseSemester?.academicYears?.length) {
            academicYearId = courseSemester.academicYears[0].id;
          }
        }
      }

      if (initialCourse.fieldId) {
        const specRes = await getSpecializations({
          IsActive: true,
          FieldId: initialCourse.fieldId,
          MaxResultCount: 1000,
        });
        if (!cancelled) {
          setSpecializations(specRes.success ? specRes.data?.items ?? [] : []);
          setLoadingSpecializations(false);
        }
      }

      if (cancelled) return;

      setFormValues({
        title: initialCourse.title ?? '',
        description: initialCourse.description ?? '',
        image: initialCourse.imageUrl || null,
        type: COURSE_TYPE_KEY_MAP[Number(initialCourse.type)] ?? '',
        price: String(initialCourse.price ?? ''),
        oldPrice: initialCourse.oldPrice ? String(initialCourse.oldPrice) : '',
        accessDurationInDays: initialCourse.accessDurationInDays
          ? String(initialCourse.accessDurationInDays)
          : '',
        currencyId: initialCourse.currencyId ?? '',
        specializationId: initialCourse.specializationId ?? '',
        facultyId: initialCourse.facultyId ?? '',
        studyMaterialId: initialCourse.studyMaterialId ?? '',
        instructorId: initialCourse.instructorId ?? '',
        fieldId: initialCourse.fieldId ?? '',
        universityId,
        academicYearId,
        semesterId,
        learningObjectives: (initialCourse.objectives ?? []).map((objective, index) => ({
          id: objective.id ?? `obj-${index}`,
          textAr: objective.text,
          textEn: objective.text,
          order: objective.order,
        })),
        chapters: mapCurriculumToFormChapters(initialCourse.curriculum),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [initialCourse]);

  // ── Cascaded fetches (each select has its own effect) ────

  useEffect(() => {
    if (!formValues.universityId) return;
    let cancelled = false;
    getFaculties({ UniversityId: formValues.universityId, IsActive: true, MaxResultCount: 1000 }).then((res) => {
      if (!cancelled) {
        setFaculties(res.success && res.data ? res.data.items : []);
        setLoadingFaculties(false);
      }
    });
    return () => { cancelled = true; };
  }, [formValues.universityId]);

  useEffect(() => {
    if (!formValues.fieldId) return;
    let cancelled = false;
    getSpecializations({ IsActive: true, FieldId: formValues.fieldId, MaxResultCount: 1000 }).then((res) => {
      if (!cancelled) {
        setSpecializations(res.success && res.data ? res.data.items : []);
        setLoadingSpecializations(false);
      }
    });
    return () => { cancelled = true; };
  }, [formValues.fieldId]);

  useEffect(() => {
    if (!formValues.facultyId || !formValues.academicYearId) return;
    let cancelled = false;
    getSemesters({
      FacultyId: formValues.facultyId,
      AcademicYearId: formValues.academicYearId,
      IsActive: true,
      MaxResultCount: 1000,
    }).then((res) => {
      if (!cancelled) {
        setSemesters(res.success && res.data ? res.data.items : []);
        setLoadingSemesters(false);
      }
    });
    return () => { cancelled = true; };
  }, [formValues.facultyId, formValues.academicYearId]);

  useEffect(() => {
    if (!formValues.facultyId || !formValues.semesterId) return;
    let cancelled = false;
    getStudyMaterialsAction({
      FacultyId: formValues.facultyId,
      SemesterId: formValues.semesterId,
      IsActive: true,
      MaxResultCount: 1000,
    }).then((res) => {
      if (!cancelled) {
        setStudyMaterials(res.success && res.data ? res.data.items : []);
        setLoadingStudyMaterials(false);
      }
    });
    return () => { cancelled = true; };
  }, [formValues.facultyId, formValues.semesterId]);

  // Academic years belonging to the selected faculty (client-side filter)
  const filteredAcademicYears = useMemo<SelectOption[]>(() => {
    if (!formValues.facultyId) return [];
    return academicYears
      .filter((year) => year.faculties.some((faculty) => faculty.id === formValues.facultyId))
      .map((year) => ({ id: year.id, nameAr: year.nameAr, nameEn: year.nameEn }));
  }, [academicYears, formValues.facultyId]);

  const handleFieldChange = useCallback(
    <K extends keyof CourseFormValues>(field: K, value: CourseFormValues[K]) => {
      setFormValues((prev) => {
        const next = { ...prev, [field]: value };

        // Reset cascading fields
        if (field === 'universityId') {
          next.facultyId = '';
          next.academicYearId = '';
          next.semesterId = '';
          next.studyMaterialId = '';
        }
        if (field === 'facultyId') {
          next.academicYearId = '';
          next.semesterId = '';
          next.studyMaterialId = '';
        }
        if (field === 'academicYearId') {
          next.semesterId = '';
          next.studyMaterialId = '';
        }
        if (field === 'semesterId') {
          next.studyMaterialId = '';
        }
        if (field === 'fieldId') {
          next.specializationId = '';
        }

        return next;
      });

      // Manage loading flags for cascading fetches
      if (field === 'universityId') {
        setLoadingFaculties(Boolean(value));
        setLoadingSemesters(false);
        setSemesters([]);
      }
      if (field === 'facultyId') {
        setLoadingSemesters(false);
        setLoadingStudyMaterials(false);
        setSemesters([]);
      }
      if (field === 'academicYearId') {
        setLoadingSemesters(Boolean(value && formValues.facultyId));
        if (!value) setSemesters([]);
      }
      if (field === 'fieldId') {
        setLoadingSpecializations(Boolean(value));
      }
      if (field === 'semesterId') {
        setLoadingStudyMaterials(Boolean(value && formValues.facultyId));
      }

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors, formValues.facultyId]
  );

  const handleChaptersChange = useCallback((chapters: Chapter[]) => {
    setFormValues((prev) => ({ ...prev, chapters }));
  }, []);

  const validateBasicInfo = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormValues, string>> = {};
    if (!formValues.title.trim()) newErrors.title = t('messages.validation_required');
    if (!formValues.description.trim()) newErrors.description = t('messages.validation_required');
    if (!formValues.type) newErrors.type = t('messages.validation_required');
    if (!formValues.price) newErrors.price = t('messages.validation_required');
    if (!formValues.currencyId) newErrors.currencyId = t('messages.validation_required');
    if (!formValues.instructorId) newErrors.instructorId = t('messages.validation_required');
    if (!formValues.facultyId) newErrors.facultyId = t('messages.validation_required');
    if (!formValues.fieldId) newErrors.fieldId = t('messages.validation_required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepClick = (step: number) => {
    if (step === 1 || validateBasicInfo()) {
      setActiveStep(step);
    }
  };

  const handleContinue = () => {
    if (validateBasicInfo()) {
      setActiveStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error(t('messages.validation_required'));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    handleSubmitWithMode('json');
  };

  const handleSubmitWithMode = async (mode: 'json' | 'indexed'): Promise<void> => {
    if (!validateBasicInfo()) {
      setActiveStep(1);
      toast.error(t('messages.validation_required'));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = buildCourseFormData(formValues, mode);

      const courseId = initialCourse?.id;
      const res = courseId
        ? await updateCourse(courseId, formData)
        : await createCourse(formData);
      if (res.success) {
        toast.success(courseId ? t('messages.course_updated') : t('messages.course_created'));
        setTimeout(() => router.push(courseId ? `/courses/${courseId}` : '/courses'), 800);
      } else {
        toast.error(res.error || t('messages.validation_required'));
      }
    } catch {
      toast.error(t('messages.validation_required'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    toast.success(t('messages.draft_saved'));
  };

  return {
    activeStep,
    formValues,
    errors,
    isSubmitting,
    universities,
    fields,
    instructors,
    currencies,
    faculties,
    specializations,
    semesters,
    studyMaterials,
    filteredAcademicYears,
    loadingFaculties,
    loadingSpecializations,
    loadingSemesters,
    loadingStudyMaterials,
    handleFieldChange,
    handleChaptersChange,
    handleStepClick,
    handleContinue,
    handleSubmit,
    handleSubmitWithMode,
    handleSaveDraft,
  };
}