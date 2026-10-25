'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  createAcademyCustomField,
  createInstructorCustomField,
  deleteAcademyCustomField,
  deleteInstructorCustomField,
  getAcademyCustomFields,
  getInstructorCustomFields,
  updateAcademyCustomField,
  updateInstructorCustomField,
} from 'src/actions/academy-custom-fields';
import { useToast } from 'src/components/toast';
import type { AcademyCustomField, AcademyCustomFieldPayload } from 'src/types/academy-custom-field';

export type CustomFieldsScope = 'academy' | 'instructor';

export default function useAcademyCustomFields(scope: CustomFieldsScope) {
  const t = useTranslations('AcademyCustomFields.messages');
  const toast = useToast();
  const [fields, setFields] = useState<AcademyCustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const loadFields = useCallback(async () => {
    setLoading(true);
    setError('');
    const response = scope === 'academy'
      ? await getAcademyCustomFields()
      : await getInstructorCustomFields();
    if (response.success && response.data) {
      setFields(response.data);
    } else {
      setFields([]);
      setError(response.error || t('load_error'));
    }
    setLoading(false);
  }, [scope, t]);

  useEffect(() => {
    void loadFields();
  }, [loadFields]);

  const saveField = async (
    data: AcademyCustomFieldPayload,
    field?: AcademyCustomField | null
  ) => {
    setSaving(true);
    const response = scope === 'academy'
      ? field
        ? await updateAcademyCustomField(field.id, data)
        : await createAcademyCustomField(data)
      : field
        ? await updateInstructorCustomField(field.id, data)
        : await createInstructorCustomField(data);

    if (response.success) {
      await loadFields();
      toast.success(t(field ? 'update_success' : 'create_success'));
      setSaving(false);
      return true;
    }

    toast.error(response.error || t(field ? 'update_error' : 'create_error'));
    setSaving(false);
    return false;
  };

  const removeField = async (field: AcademyCustomField) => {
    setDeletingId(field.id);
    const response = scope === 'academy'
      ? await deleteAcademyCustomField(field.id)
      : await deleteInstructorCustomField(field.id);
    if (response.success) {
      setFields((current) => current.filter((item) => item.id !== field.id));
      toast.success(t('delete_success'));
    } else {
      toast.error(response.error || t('delete_error'));
    }
    setDeletingId('');
    return response.success;
  };

  return {
    fields,
    loading,
    saving,
    deletingId,
    error,
    retry: loadFields,
    saveField,
    removeField,
  };
}
