'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import type { CourseDto } from 'src/types/course';

type Props = {
  courses: CourseDto[];
  onAdd: () => void;
  onRemove: (id: string) => void;
};

type CourseRow = CourseDto & { courseTitle: string; instructorValue: string; specializationValue: string; addedValue: string; removeAction: string };

export default function PackageCoursesCard({ courses, onAdd, onRemove }: Props) {
  const t = useTranslations('Packages.form.courses');
  const rows: CourseRow[] = courses.map((course) => ({
    ...course,
    courseTitle: course.title,
    instructorValue: course.instructor?.name || '—',
    specializationValue: course.specialization?.name || '—',
    addedValue: course.creationTime || '—',
    removeAction: '',
  }));

  return (
    <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
        <Stack gap={0.25}>
          <Typography variant="h6">{t('title')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('subtitle')}</Typography>
        </Stack>
        <Button variant="contained" onClick={onAdd}>{t('add')}</Button>
      </Box>
      <SharedTable
        data={rows}
        count={rows.length}
        disablePagination
        tableHead={[
          { id: 'courseTitle', label: t('name'), align: cellAlignment.right },
          { id: 'instructorValue', label: t('instructor'), align: cellAlignment.right },
          { id: 'specializationValue', label: t('specialization'), align: cellAlignment.right },
          { id: 'addedValue', label: t('price'), align: cellAlignment.right },
          { id: 'removeAction', label: '', align: cellAlignment.left },
        ]}
        customRender={{
          addedValue: (row) => `${row.price ?? 0} ${row.currency?.symbol || row.currency?.code || ''}`,
          courseTitle: (row) => <Typography variant="body2">{row.courseTitle}</Typography>,
          removeAction: (row) => <IconButton color="error" size="small" onClick={() => onRemove(row.id)}><Iconify icon="solar:trash-bin-trash-linear" /></IconButton>,
        }}
      />
    </Card>
  );
}
