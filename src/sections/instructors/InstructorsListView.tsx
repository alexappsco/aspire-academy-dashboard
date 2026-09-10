'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
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
import { useToast } from 'src/components/toast';
import { MOCK_INSTRUCTORS_LIST } from './_mock';
import { InstructorProfile } from 'src/types/instructor';

export interface InstructorTableRow extends InstructorProfile {
  checkbox?: string;
  nameCol?: string;
  qualificationCol?: string;
  countryCol?: string;
  coursesCol?: number;
  studentsCol?: number;
  ratingCol?: number;
  joinedDateCol?: string;
  statusCol?: boolean;
  actions?: string;
}

export default function InstructorsListView() {
  const router = useRouter();
  const toast = useToast();

  const [tabFilter, setTabFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [instructorsData, setInstructorsData] = useState<InstructorProfile[]>(MOCK_INSTRUCTORS_LIST);

  // Actions Popover Menu State
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorProfile | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, instructor: InstructorProfile) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedInstructor(instructor);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedInstructor(null);
  };

  const handleToggleStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInstructorsData((prev) =>
      prev.map((inst) => {
        if (inst.id === id) {
          const updated = !inst.isActive;
          if (updated) {
            toast.success(`تم تفعيل حساب ${inst.name} بنجاح`);
          } else {
            toast.warning(`تم تعطيل حساب ${inst.name}`);
          }
          return { ...inst, isActive: updated };
        }
        return inst;
      })
    );
  };

  const handleDeleteInstructor = (id: string) => {
    setInstructorsData((prev) => prev.filter((i) => i.id !== id));
    toast.error('تم حذف المحاضر من القائمة');
    handleCloseMenu();
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
  const totalCount = instructorsData.length;
  const activeCount = instructorsData.filter((s) => s.isActive).length;
  const inactiveCount = instructorsData.filter((s) => !s.isActive).length;

  const filteredData: InstructorTableRow[] = useMemo(() => {
    return instructorsData
      .filter((inst) => {
        // Tab filter
        if (tabFilter === 'active' && !inst.isActive) return false;
        if (tabFilter === 'inactive' && inst.isActive) return false;

        // Status dropdown filter
        if (statusFilter === 'active' && !inst.isActive) return false;
        if (statusFilter === 'inactive' && inst.isActive) return false;

        // Specialty filter
        if (specialtyFilter !== 'all' && !inst.specialty.includes(specialtyFilter)) return false;

        // Country filter
        if (countryFilter !== 'all' && !inst.country.includes(countryFilter)) return false;

        // Search term
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          const matchesName = inst.name.toLowerCase().includes(query);
          const matchesEmail = inst.email.toLowerCase().includes(query);
          const matchesSpecialty = inst.specialty.toLowerCase().includes(query);
          const matchesUniversity = inst.university.toLowerCase().includes(query);
          const matchesPhone = inst.phoneNumber.includes(query);
          if (!matchesName && !matchesEmail && !matchesSpecialty && !matchesUniversity && !matchesPhone) {
            return false;
          }
        }

        return true;
      })
      .map((inst) => ({
        ...inst,
      }));
  }, [instructorsData, tabFilter, statusFilter, specialtyFilter, countryFilter, searchTerm]);

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
    { id: 'nameCol', label: 'المحاضر والتخصص', align: cellAlignment.right },
    { id: 'qualificationCol', label: 'المؤهل العلمي', align: cellAlignment.center, width: 170 },
    { id: 'countryCol', label: 'الدولة والجامعة', align: cellAlignment.center, width: 170 },
    { id: 'coursesCol', label: 'الدورات', align: cellAlignment.center, width: 100 },
    { id: 'studentsCol', label: 'الطلاب', align: cellAlignment.center, width: 110 },
    { id: 'ratingCol', label: 'التقييم', align: cellAlignment.center, width: 100 },
    { id: 'joinedDateCol', label: 'تاريخ الانضمام', align: cellAlignment.center, width: 130 },
    { id: 'statusCol', label: 'الحالة', align: cellAlignment.center, width: 130 },
    { id: 'actions', label: '', align: cellAlignment.center, width: 60 },
  ];

  const customRender = {
    checkbox: (row: InstructorTableRow) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onClick={(e) => handleSelectOne(row.id, e)}
        size="small"
      />
    ),
    nameCol: (row: InstructorTableRow) => (
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
        }}
        onClick={() => router.push(`/instructors/${row.id}`)}
      >
        <Avatar
          src={row.imageUrl}
          alt={row.name}
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: '#ECFDF5',
            color: '#059669',
            fontWeight: 800,
            fontSize: 14,
            border: '1px solid #A7F3D0',
          }}
        >
          {row.avatarInitials}
        </Avatar>

        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
            {row.name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 500, mt: 0.25 }}>
            {row.title}
          </Typography>
        </Box>
      </Stack>
    ),
    qualificationCol: (row: InstructorTableRow) => (
      <Typography sx={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
        {row.qualification}
      </Typography>
    ),
    countryCol: (row: InstructorTableRow) => (
      <Box>
        <Typography sx={{ fontSize: 13, color: '#0F172A', fontWeight: 700 }}>
          {row.country}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 500 }}>
          {row.university}
        </Typography>
      </Box>
    ),
    coursesCol: (row: InstructorTableRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
        {row.totalCourses}
      </Typography>
    ),
    studentsCol: (row: InstructorTableRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#2563EB' }}>
        {row.totalStudents.toLocaleString()}
      </Typography>
    ),
    ratingCol: (row: InstructorTableRow) => (
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <Iconify icon="solar:star-bold" width={16} sx={{ color: '#F59E0B' }} />
        <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
          {row.rating}
        </Typography>
      </Stack>
    ),
    joinedDateCol: (row: InstructorTableRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {row.joinedDate}
      </Typography>
    ),
    statusCol: (row: InstructorTableRow) => (
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
    actions: (row: InstructorTableRow) => (
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
      {/* Title and Top Actions Header */}
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
            إدارة المحاضرين
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: 13.5, mt: 0.5 }}>
            عرض وإدارة ملفات المحاضرين والمدربين المعتمدين في الأكاديمية
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => router.push('/minutes-management/new')}
          startIcon={<Iconify icon="solar:user-plus-bold" width={18} />}
          sx={{
            gap: 1.25,
            '& .MuiButton-startIcon': { m: 0 },
            bgcolor: '#008767',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 14,
            px: 2.5,
            py: 1,
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#007055' },
          }}
        >
          إضافة محاضر جديد
        </Button>
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

        {/* Filter Bar (Search on Right + 3 Dropdowns on Left in RTL) */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
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
            placeholder="بحث بالاسم، البريد، أو التخصص..."
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

          {/* Filters Stack */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              gap: 1.5,
              flexShrink: 0,
              width: { xs: '100%', md: 'auto' },
            }}
          >
            {/* Specialty Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '32%', md: 130 } }}>
              <Select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                }}
              >
                <MenuItem value="all">التخصص</MenuItem>
                <MenuItem value="الباطنة">أمراض الباطنة</MenuItem>
                <MenuItem value="القلب">أمراض القلب</MenuItem>
                <MenuItem value="الجراحة">الجراحة العامة</MenuItem>
                <MenuItem value="الفارماكولوجي">الفارماكولوجي</MenuItem>
                <MenuItem value="العظام">جراحة العظام</MenuItem>
                <MenuItem value="الأطفال">طب الأطفال</MenuItem>
              </Select>
            </FormControl>

            {/* Country Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '32%', md: 120 } }}>
              <Select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                }}
              >
                <MenuItem value="all">الدولة</MenuItem>
                <MenuItem value="الكويت">الكويت</MenuItem>
                <MenuItem value="مصر">مصر</MenuItem>
                <MenuItem value="السعودية">السعودية</MenuItem>
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '32%', md: 110 } }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                }}
              >
                <MenuItem value="all">الحالة</MenuItem>
                <MenuItem value="active">مفعل</MenuItem>
                <MenuItem value="inactive">معطل</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {/* SharedTable */}
        <Box sx={{ p: 1 }}>
          <SharedTable<InstructorTableRow>
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
              minWidth: 170,
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
            if (selectedInstructor) {
              router.push(`/instructors/${selectedInstructor.id}`);
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
            if (selectedInstructor) {
              router.push(`/minutes-management/${selectedInstructor.id}`);
            }
            handleCloseMenu();
          }}
          sx={{ fontSize: 13.5, fontWeight: 600, gap: 1.5 }}
        >
          <Iconify icon="solar:pen-bold" width={18} sx={{ color: '#008767' }} />
          تعديل البيانات
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedInstructor) {
              handleToggleStatus(selectedInstructor.id);
            }
            handleCloseMenu();
          }}
          sx={{ fontSize: 13.5, fontWeight: 600, gap: 1.5 }}
        >
          <Iconify icon="solar:refresh-circle-bold" width={18} sx={{ color: '#10B981' }} />
          {selectedInstructor?.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedInstructor) {
              handleDeleteInstructor(selectedInstructor.id);
            }
          }}
          sx={{ fontSize: 13.5, fontWeight: 600, color: '#DC2626', gap: 1.5 }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} sx={{ color: '#DC2626' }} />
          حذف المحاضر
        </MenuItem>
      </Menu>
    </Box>
  );
}
