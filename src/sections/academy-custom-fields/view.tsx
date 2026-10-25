'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import type { AcademyCustomField } from 'src/types/academy-custom-field';

import CustomFieldFormDialog from './components/custom-field-form-dialog';
import DeleteCustomFieldDialog from './components/delete-custom-field-dialog';
import useAcademyCustomFields from './hooks/use-academy-custom-fields';
import type { CustomFieldsScope } from './hooks/use-academy-custom-fields';

type AcademyCustomFieldRow = AcademyCustomField & { rowActions: string };

type Props = { scope?: CustomFieldsScope };

export default function AcademyCustomFieldsView({ scope = 'academy' }: Props) {
  const t = useTranslations('AcademyCustomFields');
  const isRtl = useLocale() === 'ar';
  const customFields = useAcademyCustomFields(scope);
  const [formOpen, setFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<AcademyCustomField | null>(null);
  const [deletingField, setDeletingField] = useState<AcademyCustomField | null>(null);

  const openCreate = () => {
    setEditingField(null);
    setFormOpen(true);
  };

  const openEdit = (field: AcademyCustomField) => {
    setEditingField(field);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingField) return;
    if (await customFields.removeField(deletingField)) setDeletingField(null);
  };

  const tableHead = [
    { id: 'sortOrder', label: t('columns.sort_order'), align: cellAlignment.center, width: 120 },
    { id: 'key', label: t('columns.key'), align: isRtl ? cellAlignment.right : cellAlignment.left },
    { id: 'value', label: t('columns.value'), align: isRtl ? cellAlignment.right : cellAlignment.left },
    { id: 'rowActions', label: '', align: cellAlignment.center, width: 120 },
  ];

  const customRender = {
    rowActions: (row: AcademyCustomFieldRow) => (
      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
        <IconButton size="small" onClick={() => openEdit(row)} aria-label={t('edit')}>
          <Iconify icon="solar:pen-linear" width={19} />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => setDeletingField(row)} aria-label={t('delete')}>
          <Iconify icon="solar:trash-bin-trash-linear" width={19} />
        </IconButton>
      </Stack>
    ),
  };

  return (
    <Box sx={{ py: 2, pb: 6, display: 'grid', gap: 1.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {t(scope === 'academy' ? 'title' : 'instructor_title')}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 0.5 }}>
            {t(scope === 'academy' ? 'subtitle' : 'instructor_subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          onClick={openCreate}
          sx={{
            minWidth: 165,
            minHeight: 42,
            borderRadius: 1.5,
            bgcolor: '#17243E',
            gap: 1,
            '& .MuiButton-startIcon': { m: 0 },
          }}
        >
          {t('add')}
        </Button>
      </Stack>

      <Alert severity="info">
        {t(scope === 'academy' ? 'notice' : 'instructor_notice')}
      </Alert>

      <Card variant="outlined" sx={{ borderRadius: 2.5, boxShadow: 'none', overflow: 'hidden' }}>
        {customFields.loading ? (
          <Box sx={{ minHeight: 260, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
        ) : customFields.error ? (
          <Alert severity="error" action={<Button onClick={() => void customFields.retry()}>{t('retry')}</Button>}>
            {customFields.error}
          </Alert>
        ) : (
          <SharedTable
            data={customFields.fields.map((field) => ({ ...field, rowActions: '' }))}
            tableHead={tableHead}
            customRender={customRender}
            count={customFields.fields.length}
            disablePagination
          />
        )}
      </Card>

      <CustomFieldFormDialog
        open={formOpen}
        field={editingField}
        saving={customFields.saving}
        onClose={() => !customFields.saving && setFormOpen(false)}
        onSave={(data) => customFields.saveField(data, editingField)}
      />
      <DeleteCustomFieldDialog
        field={deletingField}
        loading={Boolean(deletingField && customFields.deletingId === deletingField.id)}
        onClose={() => setDeletingField(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}
