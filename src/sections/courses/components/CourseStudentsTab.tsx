'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import {
  bulkActivateCourseStudents,
  bulkDeactivateCourseStudents,
  getCourseStudents,
} from 'src/actions/course-students';
import type { CourseStudentItem } from 'src/types/course';

interface CourseStudentsTabProps {
  courseId: string;
}

/** SharedTable requires `id`; the bulk endpoints address students by `studentId`. */
type CourseStudentRow = CourseStudentItem & { id: string };
type BulkMode = 'activate' | 'deactivate';
type LoadResult = { ok: true; rows: CourseStudentRow[] } | { ok: false; error: string };

const TABLE_HEAD_ALIGN: { [key: string]: cellAlignment } = {
  select: cellAlignment.center,
  name: cellAlignment.right,
  email: cellAlignment.right,
  phoneNumber: cellAlignment.center,
  enrolledAt: cellAlignment.center,
  expiresAt: cellAlignment.center,
  isCourseAccessActive: cellAlignment.center,
  isCompleted: cellAlignment.center,
};

/**
 * Keeps active accounts only and collapses repeated enrolments of the same
 * student into one row, so a bulk request never sends a duplicate id.
 */
function toRows(items: CourseStudentItem[]): CourseStudentRow[] {
  const byStudent = new Map<string, CourseStudentRow>();
  items.forEach((item) => {
    if (!item.isAccountActive) return;
    if (byStudent.has(item.studentId)) return;
    byStudent.set(item.studentId, { ...item, id: item.studentId });
  });
  return [...byStudent.values()];
}

export default function CourseStudentsTab({ courseId }: CourseStudentsTabProps) {
  const t = useTranslations('CourseStudentsTab');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const toast = useToast();

  const [students, setStudents] = useState<CourseStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState<BulkMode | null>(null);
  const [confirmMode, setConfirmMode] = useState<BulkMode | null>(null);

  // Guards against a slow response from an older search overwriting a newer one.
  const requestId = useRef(0);

  const fetchStudents = useCallback(async (): Promise<LoadResult> => {
    // No `IsActive` filter: the list has to include students whose course access
    // is already off as well, otherwise there would be nothing to re-activate.
    const res = await getCourseStudents(courseId, {
      Filter: debouncedSearch.trim() || undefined,
      SkipCount: 0,
      MaxResultCount: 1000,
    });

    if (res.success && res.data) return { ok: true, rows: toRows(res.data.items) };
    return { ok: false, error: res.error || t('messages.load_failed') };
  }, [courseId, debouncedSearch, t]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let ignore = false;
    const id = requestId.current + 1;
    requestId.current = id;

    const run = async () => {
      const result = await fetchStudents();
      if (ignore || id !== requestId.current) return;
      setStudents(result.ok ? result.rows : []);
      if (!result.ok) toast.error(result.error);
      setLoading(false);
    };
    run();

    return () => {
      ignore = true;
    };
  }, [fetchStudents, toast]);

  /** Re-reads the list after a mutation, so the access flags come back from the server. */
  const reload = async () => {
    const id = requestId.current + 1;
    requestId.current = id;

    const result = await fetchStudents();
    if (id !== requestId.current) return;
    setStudents(result.ok ? result.rows : []);
    if (!result.ok) toast.error(result.error);
  };

  // `isCourseAccessActive` decides which endpoint each selected student belongs to:
  // false → activate, true → deactivate.
  const selectedStudents = useMemo(
    () => students.filter((student) => selectedIds.has(student.studentId)),
    [students, selectedIds]
  );
  const toActivate = useMemo(
    () => selectedStudents.filter((student) => !student.isCourseAccessActive),
    [selectedStudents]
  );
  const toDeactivate = useMemo(
    () => selectedStudents.filter((student) => student.isCourseAccessActive),
    [selectedStudents]
  );

  const allSelected = students.length > 0 && selectedIds.size === students.length;
  const indeterminate = selectedIds.size > 0 && !allSelected;

  const toggleOne = (studentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(students.map((student) => student.studentId)));
  };

  const runBulk = async (mode: BulkMode) => {
    const targets = mode === 'activate' ? toActivate : toDeactivate;
    if (targets.length === 0) return;

    setBulkLoading(mode);
    const studentIds = targets.map((student) => student.studentId);

    try {
      const res =
        mode === 'activate'
          ? await bulkActivateCourseStudents(courseId, studentIds)
          : await bulkDeactivateCourseStudents(courseId, studentIds);

      // HTTP 200 is returned even when every student fails, so the payload counts decide.
      if (res.success && res.data) {
        const succeeded = res.data.succeededCount ?? 0;
        const failed = res.data.failedCount ?? 0;
        const firstFailure = res.data.failed?.[0]?.message;

        if (failed === 0) {
          toast.success(
            mode === 'activate'
              ? t('messages.activate_success', { count: succeeded })
              : t('messages.deactivate_success', { count: succeeded })
          );
        } else if (succeeded === 0) {
          toast.error(t('messages.failed', { message: firstFailure || t('messages.request_failed') }));
        } else {
          toast.warning(
            t('messages.partial', {
              succeeded,
              failed,
              message: firstFailure || t('messages.request_failed'),
            })
          );
        }
      } else {
        toast.error(res.error || t('messages.request_failed'));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('messages.request_failed'));
    } finally {
      setBulkLoading(null);
      setConfirmMode(null);
      setSelectedIds(new Set());
      await reload();
    }
  };

  const requestBulk = (mode: BulkMode) => {
    if (selectedStudents.length === 0) {
      toast.info(t('messages.select_first'));
      return;
    }
    const eligible = mode === 'activate' ? toActivate : toDeactivate;
    if (eligible.length === 0) {
      toast.info(
        mode === 'activate' ? t('messages.nothing_to_activate') : t('messages.nothing_to_deactivate')
      );
      return;
    }
    setConfirmMode(mode);
  };

  const formatDate = (value?: string | null): string =>
    value ? new Date(value).toLocaleDateString(isRtl ? 'ar-KW' : 'en-US') : '—';

  const tableHead = [
    {
      id: 'select',
      align: TABLE_HEAD_ALIGN.select,
      width: 52,
      label: (
        <Checkbox
          checked={allSelected}
          indeterminate={indeterminate}
          disabled={loading || students.length === 0 || Boolean(bulkLoading)}
          onChange={toggleAll}
          size="small"
          sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#0284C7' } }}
        />
      ),
    },
    { id: 'name', label: t('columns.student'), align: TABLE_HEAD_ALIGN.name },
    { id: 'email', label: t('columns.email'), align: TABLE_HEAD_ALIGN.email },
    { id: 'phoneNumber', label: t('columns.phone'), align: TABLE_HEAD_ALIGN.phoneNumber, width: 140 },
    {
      id: 'enrolledAt',
      label: t('columns.enrolled_at'),
      align: TABLE_HEAD_ALIGN.enrolledAt,
      width: 140,
    },
    {
      id: 'expiresAt',
      label: t('columns.expires_at'),
      align: TABLE_HEAD_ALIGN.expiresAt,
      width: 140,
    },
    {
      id: 'isCourseAccessActive',
      label: t('columns.access'),
      align: TABLE_HEAD_ALIGN.isCourseAccessActive,
      width: 130,
    },
    {
      id: 'isCompleted',
      label: t('columns.completed'),
      align: TABLE_HEAD_ALIGN.isCompleted,
      width: 120,
    },
  ];

  const customRender = {
    select: (row: CourseStudentRow) => (
      <Checkbox
        checked={selectedIds.has(row.studentId)}
        disabled={Boolean(bulkLoading)}
        onChange={() => toggleOne(row.studentId)}
        size="small"
        sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#0284C7' } }}
      />
    ),
    name: (row: CourseStudentRow) => (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar
          src={row.imageUrl || undefined}
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#EFF6FF',
            color: '#0284C7',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {(row.name || '?').charAt(0)}
        </Avatar>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
          {row.name || '—'}
        </Typography>
      </Stack>
    ),
    email: (row: CourseStudentRow) => (
      <Typography
        sx={{
          fontSize: 13,
          color: '#475569',
          fontWeight: 500,
          maxWidth: 220,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {row.email || '—'}
      </Typography>
    ),
    phoneNumber: (row: CourseStudentRow) => (
      <Typography sx={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
        {row.phoneNumber || '—'}
      </Typography>
    ),
    enrolledAt: (row: CourseStudentRow) => (
      <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
        {formatDate(row.enrolledAt)}
      </Typography>
    ),
    expiresAt: (row: CourseStudentRow) => (
      <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
        {formatDate(row.expiresAt)}
      </Typography>
    ),
    isCourseAccessActive: (row: CourseStudentRow) => (
      <Chip
        label={row.isCourseAccessActive ? t('access.active') : t('access.inactive')}
        size="small"
        sx={{
          bgcolor: row.isCourseAccessActive ? '#D1FAE5' : '#FEE2E2',
          color: row.isCourseAccessActive ? '#059669' : '#DC2626',
          fontWeight: 700,
          fontSize: 12,
          borderRadius: 1.5,
        }}
      />
    ),
    isCompleted: (row: CourseStudentRow) => (
      <Chip
        label={row.isCompleted ? t('completed.done') : t('completed.pending')}
        size="small"
        sx={{
          bgcolor: row.isCompleted ? '#DBEAFE' : '#F1F5F9',
          color: row.isCompleted ? '#1D4ED8' : '#64748B',
          fontWeight: 700,
          fontSize: 12,
          borderRadius: 1.5,
        }}
      />
    ),
  };

  const confirmCount = confirmMode === 'activate' ? toActivate.length : toDeactivate.length;

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F3F5',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={t('search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-linear" width={18} sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            mb: 2,
            bgcolor: '#F8FAFC',
            '& .MuiOutlinedInput-root': { borderRadius: 2 },
          }}
        />

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 2,
            px: 1.5,
            py: 1.25,
            borderRadius: 2,
            bgcolor: '#F8FAFC',
            border: '1px solid #EEF2F6',
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
            {t('bulk.selected', { count: selectedIds.size })}
          </Typography>

          {selectedIds.size > 0 && (
            <Button
              size="small"
              onClick={() => setSelectedIds(new Set())}
              disabled={Boolean(bulkLoading)}
              sx={{ fontWeight: 700, fontSize: 12, color: '#64748B' }}
            >
              {t('bulk.clear')}
            </Button>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Button
            size="small"
            variant="contained"
            disabled={toActivate.length === 0 || Boolean(bulkLoading)}
            onClick={() => requestBulk('activate')}
            startIcon={
              bulkLoading === 'activate' ? (
                <CircularProgress size={15} color="inherit" />
              ) : (
                <Iconify icon="eva:checkmark-fill" width={15} />
              )
            }
            sx={{
              bgcolor: '#10B981',
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 1.5,
              height: 32,
              px: 1.75,
              boxShadow: 'none',
              '& .MuiButton-startIcon': { m: 0 },
              '&:hover': { bgcolor: '#059669' },
            }}
          >
            {t('bulk.activate')}
          </Button>

          <Button
            size="small"
            variant="contained"
            disabled={toDeactivate.length === 0 || Boolean(bulkLoading)}
            onClick={() => requestBulk('deactivate')}
            startIcon={
              bulkLoading === 'deactivate' ? (
                <CircularProgress size={15} color="inherit" />
              ) : (
                <Iconify icon="eva:close-fill" width={15} />
              )
            }
            sx={{
              bgcolor: '#BE123C',
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 1.5,
              height: 32,
              px: 1.75,
              boxShadow: 'none',
              '& .MuiButton-startIcon': { m: 0 },
              '&:hover': { bgcolor: '#9F1239' },
            }}
          >
            {t('bulk.deactivate')}
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={32} sx={{ color: '#0284C7' }} />
          </Box>
        ) : (
          <SharedTable<CourseStudentRow>
            data={students}
            count={students.length}
            tableHead={tableHead}
            customRender={customRender}
          />
        )}
      </Card>

      <Dialog
        open={Boolean(confirmMode)}
        onClose={() => (bulkLoading ? undefined : setConfirmMode(null))}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 17, color: '#0F172A' }}>
          {confirmMode === 'activate' ? t('confirm.activate_title') : t('confirm.deactivate_title')}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: '#64748B', fontWeight: 500, lineHeight: 1.7 }}>
            {confirmMode === 'activate'
              ? t('confirm.activate_body', { count: confirmCount })
              : t('confirm.deactivate_body', { count: confirmCount })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setConfirmMode(null)}
            disabled={Boolean(bulkLoading)}
            sx={{ borderRadius: 2, color: '#475569', borderColor: '#E2E8F0', fontWeight: 600 }}
          >
            {t('confirm.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => confirmMode && runBulk(confirmMode)}
            disabled={Boolean(bulkLoading)}
            startIcon={
              bulkLoading ? <CircularProgress size={16} color="inherit" /> : undefined
            }
            sx={{
              bgcolor: confirmMode === 'activate' ? '#10B981' : '#BE123C',
              borderRadius: 2,
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': { bgcolor: confirmMode === 'activate' ? '#059669' : '#9F1239' },
            }}
          >
            {confirmMode === 'activate' ? t('confirm.activate') : t('confirm.deactivate')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
