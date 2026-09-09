'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
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

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useRouter } from 'src/i18n/routing';
import { MOCK_STUDENTS } from './_mock';
import { StudentItem } from 'src/types/student';

export interface StudentTableRow extends StudentItem {
  checkbox?: string;
  name?: string;
  joined_date?: string;
  phone?: string;
  courses_count?: number;
  progress?: number;
  status?: boolean;
  actions?: string;
}

export default function StudentsListView() {
  const t = useTranslations('Students');
  const router = useRouter();

  const [tabFilter, setTabFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [studentsData, setStudentsData] = useState<StudentItem[]>(MOCK_STUDENTS);

  // Actions Popover Menu State
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, student: StudentItem) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedStudent(null);
  };

  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudentsData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredData.map((s) => s.id));
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
  const totalCount = studentsData.length;
  const activeCount = studentsData.filter((s) => s.isActive).length;
  const inactiveCount = studentsData.filter((s) => !s.isActive).length;

  const filteredData: StudentTableRow[] = useMemo(() => {
    return studentsData
      .filter((student) => {
        // Tab filter
        if (tabFilter === 'active' && !student.isActive) return false;
        if (tabFilter === 'inactive' && student.isActive) return false;

        // Status dropdown filter
        if (statusFilter === 'active' && !student.isActive) return false;
        if (statusFilter === 'inactive' && student.isActive) return false;

        // Search term
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          const matchesNameAr = student.nameAr.toLowerCase().includes(query);
          const matchesNameEn = student.nameEn.toLowerCase().includes(query);
          const matchesPhone = student.phoneNumber.includes(query);
          const matchesCode = student.studentCode.toLowerCase().includes(query);
          if (!matchesNameAr && !matchesNameEn && !matchesPhone && !matchesCode) {
            return false;
          }
        }

        return true;
      })
      .map((student) => ({
        ...student,
      }));
  }, [studentsData, tabFilter, statusFilter, searchTerm]);

  const allSelected = filteredData.length > 0 && selectedIds.length === filteredData.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < filteredData.length;

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
    { id: 'name', label: 'الاسم', align: cellAlignment.right },
    { id: 'joined_date', label: 'تاريخ الانضمام', align: cellAlignment.center, width: 140 },
    { id: 'phone', label: 'رقم الهاتف', align: cellAlignment.center, width: 160 },
    { id: 'courses_count', label: 'عدد الدورات', align: cellAlignment.center, width: 120 },
    { id: 'progress', label: 'التقدم', align: cellAlignment.center, width: 120 },
    { id: 'status', label: 'الحالة', align: cellAlignment.center, width: 140 },
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
    name: (row: StudentTableRow) => (
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
          src={row.avatar}
          alt={row.nameAr}
          sx={{
            width: 42,
            height: 42,
            bgcolor: '#EFF6FF',
            color: '#2563EB',
            fontWeight: 700,
          }}
        >
          {row.nameAr.slice(0, 2)}
        </Avatar>

        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
            {row.nameAr}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>
            {row.nameEn}
          </Typography>
        </Box>
      </Stack>
    ),
    joined_date: (row: StudentTableRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {row.joinedDate}
      </Typography>
    ),
    phone: (row: StudentTableRow) => (
      <Typography
        sx={{
          fontSize: 13,
          color: '#334155',
          fontWeight: 600,
          direction: 'ltr',
          display: 'inline-block',
        }}
      >
        {row.phoneNumber}
      </Typography>
    ),
    courses_count: (row: StudentTableRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
        {row.coursesCount}
      </Typography>
    ),
    progress: (row: StudentTableRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
        {row.progressPercent}%
      </Typography>
    ),
    status: (row: StudentTableRow) => (
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Switch
          checked={row.isActive}
          onChange={() => {}}
          onClick={(e) => handleToggleStatus(row.id, e)}
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
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: '#0F172A',
          fontSize: { xs: 22, md: 26 },
          mb: 3,
        }}
      >
        إدارة الطلاب
      </Typography>

      {/* Main Card */}
      <Card
        sx={{
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        {/* Tabs Filter (الكل 80 | مفعل 22 | معطل 32) */}
        <Box sx={{ borderBottom: '1px solid #F1F5F9', px: 2.5, pt: 1 }}>
          <Tabs
            value={tabFilter}
            onChange={(_, val) => setTabFilter(val)}
            sx={{
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
            placeholder="بحث..."
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
              <MenuItem value="all">الحالة</MenuItem>
              <MenuItem value="active">مفعل</MenuItem>
              <MenuItem value="inactive">معطل</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* SharedTable */}
        <Box sx={{ p: 1 }}>
          <SharedTable<StudentTableRow>
            data={filteredData}
            count={filteredData.length}
            tableHead={tableHead}
            customRender={customRender}
            disablePagination={false}
          />
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
              handleToggleStatus(selectedStudent.id, { stopPropagation: () => {} } as any);
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
              setStudentsData((prev) => prev.filter((s) => s.id !== selectedStudent.id));
            }
            handleCloseMenu();
          }}
          sx={{ fontSize: 13.5, fontWeight: 600, color: '#DC2626', gap: 1.5 }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} sx={{ color: '#DC2626' }} />
          حذف الطالب
        </MenuItem>
      </Menu>
    </Box>
  );
}
