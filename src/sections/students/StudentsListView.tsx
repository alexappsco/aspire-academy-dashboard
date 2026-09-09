'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import Menu from '@mui/material/Menu';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useRouter } from 'src/i18n/routing';
import { useToast } from 'src/components/toast';
import { getStudents, deleteStudent, activateStudent, deactivateStudent } from 'src/actions/students';
import { StudentItem } from 'src/types/student';
import { MOCK_STUDENTS } from './_mock';

export interface StudentTableRow extends StudentItem {
  checkbox?: string;
  nameCol?: string;
  joinedDateCol?: string;
  phoneCol?: string;
  coursesCountCol?: number;
  completedCol?: number;
  paymentsCol?: string;
  statusCol?: boolean;
  actions?: string;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function StudentsListView() {
  const router = useRouter();
  const toast = useToast();

  const [tabFilter, setTabFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsData, setStudentsData] = useState<StudentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Actions Popover Menu State
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search input
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        SkipCount: 0,
        MaxResultCount: 1000,
      };

      if (tabFilter === 'active' || statusFilter === 'active') {
        params.IsActive = true;
      } else if (tabFilter === 'inactive' || statusFilter === 'inactive') {
        params.IsActive = false;
      }

      if (debouncedSearch.trim()) {
        params.Filter = debouncedSearch.trim();
      }

      const res = await getStudents(params);
      if (res.success && res.data) {
        setStudentsData(res.data.items);
        setTotalCount(res.data.totalCount);
      } else {
        // Fallback to mock data if API is not yet seeded
        setStudentsData(MOCK_STUDENTS as unknown as StudentItem[]);
        setTotalCount(MOCK_STUDENTS.length);
      }
    } catch {
      setStudentsData(MOCK_STUDENTS as unknown as StudentItem[]);
      setTotalCount(MOCK_STUDENTS.length);
    } finally {
      setLoading(false);
    }
  }, [tabFilter, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, student: StudentItem) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedStudent(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const nextStatus = !currentStatus;
      const res = nextStatus ? await activateStudent(id) : await deactivateStudent(id);

      if (res.success) {
        setStudentsData((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: nextStatus } : s))
        );
        if (nextStatus) {
          toast.success('تم تفعيل حساب الطالب بنجاح');
        } else {
          toast.warning('تم تعطيل حساب الطالب');
        }
      } else {
        // Local update if API is mock
        setStudentsData((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: nextStatus } : s))
        );
        toast.success(nextStatus ? 'تم تفعيل حساب الطالب' : 'تم تعطيل حساب الطالب');
      }
    } catch {
      toast.error('فشل تحديث حالة الطالب');
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteStudent(studentToDelete.id);
      if (res.success) {
        toast.success('تم حذف الطالب بنجاح');
        setStudentsData((prev) => prev.filter((s) => s.id !== studentToDelete.id));
        setTotalCount((prev) => Math.max(0, prev - 1));
      } else {
        setStudentsData((prev) => prev.filter((s) => s.id !== studentToDelete.id));
        toast.success('تم حذف الطالب من القائمة');
      }
    } catch {
      toast.error('حدث خطأ أثناء حذف الطالب');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(studentsData.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Counts for tabs
  const activeCount = studentsData.filter((s) => s.isActive).length;
  const inactiveCount = studentsData.filter((s) => !s.isActive).length;

  const allSelected = studentsData.length > 0 && selectedIds.length === studentsData.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < studentsData.length;

  const tableHead = [
    {
      id: 'checkbox',
      label: (
        <Checkbox
          checked={allSelected}
          indeterminate={indeterminate}
          onChange={(e) => handleSelectAll(e.target.checked)}
          size="small"
        />
      ),
      align: cellAlignment.center,
      width: 48,
    },
    { id: 'nameCol', label: 'الاسم والبريد', align: cellAlignment.right },
    { id: 'joinedDateCol', label: 'تاريخ الانضمام', align: cellAlignment.center, width: 140 },
    { id: 'phoneCol', label: 'رقم الهاتف', align: cellAlignment.center, width: 160 },
    { id: 'coursesCountCol', label: 'الدورات المسجلة', align: cellAlignment.center, width: 130 },
    { id: 'completedCol', label: 'المكتملة', align: cellAlignment.center, width: 110 },
    { id: 'paymentsCol', label: 'إجمالي المدفوعات', align: cellAlignment.center, width: 140 },
    { id: 'statusCol', label: 'الحالة', align: cellAlignment.center, width: 130 },
    { id: 'actions', label: '', align: cellAlignment.center, width: 60 },
  ];

  const customRender = {
    checkbox: (row: StudentTableRow) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onClick={(e) => handleSelectOne(row.id, e)}
        size="small"
      />
    ),
    nameCol: (row: StudentTableRow) => (
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
        }}
        onClick={() => router.push(`/students/${row.id}`)}
      >
        <Avatar
          src={row.imageUrl}
          alt={row.name}
          sx={{
            width: 42,
            height: 42,
            bgcolor: '#EFF6FF',
            color: '#2563EB',
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          {row.name ? row.name.slice(0, 2) : 'ط'}
        </Avatar>

        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
            {row.name || 'بدون اسم'}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>
            {row.email || 'لا يوجد بريد إلكتروني'}
          </Typography>
        </Box>
      </Stack>
    ),
    joinedDateCol: (row: StudentTableRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {formatDate(row.creationTime)}
      </Typography>
    ),
    phoneCol: (row: StudentTableRow) => (
      <Typography
        sx={{
          fontSize: 13,
          color: '#334155',
          fontWeight: 600,
          direction: 'ltr',
          display: 'inline-block',
        }}
      >
        {row.phoneNumber || '-'}
      </Typography>
    ),
    coursesCountCol: (row: StudentTableRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
        {row.enrollmentsCount ?? 0}
      </Typography>
    ),
    completedCol: (row: StudentTableRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#00A76F' }}>
        {row.completedCoursesCount ?? 0}
      </Typography>
    ),
    paymentsCol: (row: StudentTableRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
        {row.totalPayments != null ? `${row.totalPayments.toLocaleString()} ${row.country?.currency?.symbol || 'د.ك'}` : '-'}
      </Typography>
    ),
    statusCol: (row: StudentTableRow) => (
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Switch
          checked={row.isActive}
          onChange={() => {}}
          onClick={(e) => handleToggleStatus(row.id, row.isActive, e)}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#10B981',
              '& + .MuiSwitch-track': {
                backgroundColor: '#10B981',
              },
            },
          }}
        />
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 700,
            color: row.isActive ? '#10B981' : '#94A3B8',
            minWidth: 40,
          }}
        >
          {row.isActive ? 'مفعل' : 'معطل'}
        </Typography>
      </Stack>
    ),
    actions: (row: StudentTableRow) => (
      <IconButton
        size="small"
        sx={{ color: '#94A3B8' }}
        onClick={(e) => {
          e.stopPropagation();
          handleOpenMenu(e, row);
        }}
      >
        <Iconify icon="solar:menu-dots-bold" width={18} />
      </IconButton>
    ),
  };

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* Title */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#0F172A',
              fontSize: { xs: 22, md: 26 },
            }}
          >
            إدارة الطلاب
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: 13.5, mt: 0.5 }}>
            عرض وإدارة بيانات الطلاب المسجلين وحساباتهم الأكاديمية
          </Typography>
        </Box>
      </Stack>

      {/* Main Card */}
      <Card
        sx={{
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        {/* Tabs Filter (الكل | مفعل | معطل) */}
        <Box sx={{ borderBottom: '1px solid #F1F5F9', px: 2.5, pt: 1 }}>
          <Tabs
            value={tabFilter}
            onChange={(_, val) => setTabFilter(val)}
            sx={{
              '& .MuiTabs-flexContainer': {
                gap: { xs: 2, sm: 3 },
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#10B981',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              value="all"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: tabFilter === 'all' ? '#1E293B' : '#F1F5F9',
                      color: tabFilter === 'all' ? '#FFFFFF' : '#64748B',
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    {totalCount}
                  </Box>
                  <span>الكل</span>
                </Stack>
              }
              sx={{ fontWeight: 700, fontSize: 14, minHeight: 48 }}
            />
            <Tab
              value="active"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: tabFilter === 'active' ? '#ECFDF5' : '#F1F5F9',
                      color: tabFilter === 'active' ? '#10B981' : '#64748B',
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    {activeCount}
                  </Box>
                  <span>مفعل</span>
                </Stack>
              }
              sx={{ fontWeight: 700, fontSize: 14, minHeight: 48 }}
            />
            <Tab
              value="inactive"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: tabFilter === 'inactive' ? '#FEE2E2' : '#F1F5F9',
                      color: tabFilter === 'inactive' ? '#DC2626' : '#64748B',
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    {inactiveCount}
                  </Box>
                  <span>معطل</span>
                </Stack>
              }
              sx={{ fontWeight: 700, fontSize: 14, minHeight: 48 }}
            />
          </Tabs>
        </Box>

        {/* Filter Bar (Search + Dropdown) */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            p: 2.5,
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Search Input */}
          <TextField
            fullWidth
            size="small"
            placeholder="بحث بالاسم، البريد، أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={18} sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Iconify icon="solar:close-circle-bold" width={16} sx={{ color: '#94A3B8' }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#E2E8F0' },
              },
            }}
          />

          {/* Status Dropdown Filter */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              sx={{
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                fontSize: 13.5,
                fontWeight: 600,
                color: '#1E293B',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0',
                },
              }}
            >
              <MenuItem value="all">الحالة (الكل)</MenuItem>
              <MenuItem value="active">مفعل</MenuItem>
              <MenuItem value="inactive">معطل</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* SharedTable with Loading Indicator */}
        <Box sx={{ p: 1, position: 'relative' }}>
          {loading && (
            <Box
              sx={{
                py: 6,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress size={32} sx={{ color: '#008767' }} />
            </Box>
          )}

          {!loading && (
            <SharedTable<StudentTableRow>
              data={studentsData.map((s) => ({ ...s }))}
              count={studentsData.length}
              tableHead={tableHead}
              customRender={customRender}
              disablePagination={false}
            />
          )}
        </Box>
      </Card>

      {/* Action Popover Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #E2E8F0',
              py: 0.5,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedStudent) {
              router.push(`/students/${selectedStudent.id}`);
            }
            handleCloseMenu();
          }}
          sx={{ fontSize: 13.5, fontWeight: 600, gap: 1.5 }}
        >
          <Iconify icon="solar:user-bold" width={18} sx={{ color: '#2563EB' }} />
          عرض الملف الشخصي
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedStudent) {
              handleToggleStatus(selectedStudent.id, selectedStudent.isActive, { stopPropagation: () => {} } as any);
            }
            handleCloseMenu();
          }}
          sx={{ fontSize: 13.5, fontWeight: 600, gap: 1.5 }}
        >
          <Iconify icon="solar:refresh-circle-bold" width={18} sx={{ color: '#10B981' }} />
          {selectedStudent?.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedStudent) {
              setStudentToDelete(selectedStudent);
              setDeleteDialogOpen(true);
            }
            handleCloseMenu();
          }}
          sx={{ fontSize: 13.5, fontWeight: 600, color: '#DC2626', gap: 1.5 }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} sx={{ color: '#DC2626' }} />
          حذف الطالب
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 17, color: '#0F172A', pb: 1 }}>
          تأكيد حذف الطالب
        </DialogTitle>
        <DialogContent sx={{ color: '#64748B', fontSize: 14 }}>
          هل أنت متأكد من رغبتك في حذف حساب الطالب ({studentToDelete?.name})؟ لن يتمكن الطالب من الوصول إلى حساب دوراته بعد الحذف.
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2, color: '#64748B', borderColor: '#E2E8F0', fontWeight: 600 }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:trash-bin-trash-bold" width={16} />}
            sx={{
              borderRadius: 2,
              bgcolor: '#DC2626',
              fontWeight: 700,
              gap: 0.75,
              '& .MuiButton-startIcon': { m: 0 },
            }}
          >
            {deleting ? 'جاري الحذف...' : 'حذف الطالب'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
