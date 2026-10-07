'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import TablePagination from '@mui/material/TablePagination';
import { useRouter } from 'src/i18n/routing';
import Iconify from 'src/components/iconify';
import {
  MOCK_PRIVATE_REQUESTS,
  INITIAL_SERVICE_SETTINGS,
} from './_mock';
import {
  PrivateRequestItem,
  PrivateRequestStatus,
  ServiceSettings,
} from 'src/types/private-request';
import ServiceToggleCards from './components/ServiceToggleCards';

export default function PrivateRequestsListView() {
  const router = useRouter();

  const [settings, setSettings] = useState<ServiceSettings>(INITIAL_SERVICE_SETTINGS);
  const [requests] = useState<PrivateRequestItem[]>(MOCK_PRIVATE_REQUESTS);

  // Tab Filter
  const [currentTab, setCurrentTab] = useState<'all' | 'new' | 'pending_admin' | 'active' | 'completed'>('all');

  // Filter Bar States
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'all' | 'recorded' | 'live'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Action Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<PrivateRequestItem | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, req: PrivateRequestItem) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedRequest(req);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleNavigateToDetails = useCallback(
    (id: string) => {
      handleCloseMenu();
      router.push(`/private-requests/${id}`);
    },
    [router]
  );

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: 80,
      new: 18,
      pending_admin: 22,
      active: 22,
      completed: 32,
    };
  }, []);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Tab filter
      if (currentTab === 'new' && req.status !== 'new') return false;
      if (currentTab === 'pending_admin' && req.status !== 'pending_admin') return false;
      if (currentTab === 'active' && req.status !== 'active') return false;
      if (currentTab === 'completed' && req.status !== 'completed') return false;

      // 2. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = req.student.name.toLowerCase().includes(q);
        const matchesId = req.id.toLowerCase().includes(q);
        const matchesDesc = req.description.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDesc) return false;
      }

      // 3. Service type filter
      if (serviceTypeFilter !== 'all' && req.serviceType !== serviceTypeFilter) {
        return false;
      }

      // 4. Status select filter
      if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [requests, currentTab, searchQuery, serviceTypeFilter, statusFilter]);

  // Paginated requests
  const paginatedRequests = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRequests.slice(start, start + rowsPerPage);
  }, [filteredRequests, page, rowsPerPage]);

  return (
    <Box sx={{ py: 2, pb: 8 }}>
      {/* 1. Page Title */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#0F172A',
            fontSize: { xs: 22, md: 26 },
          }}
        >
          الطلبات الخاصة
        </Typography>
      </Stack>

      {/* 2. Top Toggle Cards: Private Recorded & Private Live (Image 1) */}
      <ServiceToggleCards settings={settings} onSettingsChange={setSettings} />

      {/* 3. Main Card with Tabs & Filters & Table */}
      <Card
        sx={{
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        {/* Top Tabs with counts */}
        <Box sx={{ borderBottom: '1px solid #F1F5F9', px: 2 }}>
          <Tabs
            value={currentTab}
            onChange={(_, val) => {
              setCurrentTab(val);
              setPage(0);
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 52,
              '& .MuiTab-root': {
                minHeight: 52,
                fontWeight: 700,
                fontSize: 14,
                px: 2,
              },
              '& .Mui-selected': {
                color: '#0F172A !important',
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#0F172A',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              value="all"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={counts.all}
                    size="small"
                    sx={{
                      bgcolor: currentTab === 'all' ? '#0F172A' : '#F1F5F9',
                      color: currentTab === 'all' ? '#FFFFFF' : '#64748B',
                      fontWeight: 700,
                      height: 22,
                    }}
                  />
                  <span>الكل</span>
                </Stack>
              }
            />
            <Tab
              value="new"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={counts.new}
                    size="small"
                    sx={{
                      bgcolor: currentTab === 'new' ? '#E0F2FE' : '#F1F5F9',
                      color: currentTab === 'new' ? '#0284C7' : '#64748B',
                      fontWeight: 700,
                      height: 22,
                    }}
                  />
                  <span>جديد</span>
                </Stack>
              }
            />
            <Tab
              value="pending_admin"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={counts.pending_admin}
                    size="small"
                    sx={{
                      bgcolor: currentTab === 'pending_admin' ? '#FEF3C7' : '#F1F5F9',
                      color: currentTab === 'pending_admin' ? '#D97706' : '#64748B',
                      fontWeight: 700,
                      height: 22,
                    }}
                  />
                  <span>بانتظار التاكيد</span>
                </Stack>
              }
            />
            <Tab
              value="active"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={counts.active}
                    size="small"
                    sx={{
                      bgcolor: currentTab === 'active' ? '#DCFCE7' : '#F1F5F9',
                      color: currentTab === 'active' ? '#15803D' : '#64748B',
                      fontWeight: 700,
                      height: 22,
                    }}
                  />
                  <span>نشط</span>
                </Stack>
              }
            />
            <Tab
              value="completed"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={counts.completed}
                    size="small"
                    sx={{
                      bgcolor: currentTab === 'completed' ? '#E2E8F0' : '#F1F5F9',
                      color: currentTab === 'completed' ? '#334155' : '#64748B',
                      fontWeight: 700,
                      height: 22,
                    }}
                  />
                  <span>منتهي</span>
                </Stack>
              }
            />
          </Tabs>
        </Box>

        {/* Filter Controls Bar: Search on FAR RIGHT (First in RTL), Selects on LEFT */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Search Input: Far Right in RTL */}
          <TextField
            size="small"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
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
              width: { xs: '100%', md: 280 },
              '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13.5 },
            }}
          />

          {/* Filters: Date, Service Type, Status (Left side in RTL) */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1.5,
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <TextField
              size="small"
              placeholder="التاريخ"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:calendar-linear" width={18} sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: { xs: 'calc(50% - 6px)', sm: 140 },
                '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 },
              }}
            />

            <FormControl size="small" sx={{ width: { xs: 'calc(50% - 6px)', sm: 140 } }}>
              <Select
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value as any)}
                displayEmpty
                sx={{ borderRadius: 2, bgcolor: '#FFFFFF', fontSize: 13 }}
              >
                <MenuItem value="all">نوع الخدمة</MenuItem>
                <MenuItem value="recorded">مسجل</MenuItem>
                <MenuItem value="live">لايف</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ width: { xs: '100%', sm: 130 } }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2, bgcolor: '#FFFFFF', fontSize: 13 }}
              >
                <MenuItem value="all">الحالة</MenuItem>
                <MenuItem value="new">جديد</MenuItem>
                <MenuItem value="pending_admin">بانتظار التأكيد</MenuItem>
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="completed">منتهي</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Table Content: Column 1 on Right is Request ID, Column 7 on Left is Actions */}
        <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 800,
            }}
          >
            {/* Table Header */}
            <Box component="thead">
              <Box
                component="tr"
                sx={{
                  bgcolor: '#F8FAFC',
                  '& th': {
                    p: 2,
                    color: '#64748B',
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: 'center',
                    borderBottom: '1px solid #F1F5F9',
                  },
                }}
              >
                <Box component="th" sx={{ textAlign: 'start !important', pr: 3, width: 120 }}>رقم الطلب</Box>
                <Box component="th" sx={{ textAlign: 'start !important' }}>الطالب والجهة</Box>
                <Box component="th">تاريخ الطلب</Box>
                <Box component="th">نوع الخدمة</Box>
                <Box component="th" sx={{ textAlign: 'start !important', maxWidth: 300 }}>الوصف</Box>
                <Box component="th">الحالة</Box>
                <Box component="th" sx={{ width: 50 }}>الإجراءات</Box>
              </Box>
            </Box>

            {/* Table Body */}
            <Box component="tbody">
              {paginatedRequests.map((req) => {
                const isRec = req.serviceType === 'recorded';
                const isAct = req.status === 'active';
                const isNewReq = req.status === 'new';

                return (
                  <Box
                    component="tr"
                    key={req.id}
                    onClick={() => handleNavigateToDetails(req.id)}
                    sx={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #F1F5F9',
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '& td': { p: 2, fontSize: 13, textAlign: 'center' },
                    }}
                  >
                    {/* 1. Request ID (Far Right) */}
                    <Box component="td" sx={{ textAlign: 'start !important', pr: 3, fontWeight: 700, color: '#0F172A' }}>
                      #{req.id}
                    </Box>

                    {/* 2. Student & Scope */}
                    <Box component="td" sx={{ textAlign: 'start !important' }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={req.student.avatar}
                          alt={req.student.name}
                          sx={{ width: 36, height: 36 }}
                        />
                        <Box>
                          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                            {req.student.name}
                          </Typography>
                          <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>
                            {req.targetAudience === 'direct' ? 'موجه لك خصيصاً' : 'طلب موجه للجميع'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* 3. Submitted Date */}
                    <Box component="td" sx={{ color: '#64748B' }}>
                      {req.createdAt || '6/10/2026'}
                    </Box>

                    {/* 4. Service Type */}
                    <Box component="td" sx={{ color: '#334155', fontWeight: 600 }}>
                      {isRec ? 'مسجل' : 'لايف'}
                    </Box>

                    {/* 5. Description */}
                    <Box
                      component="td"
                      sx={{
                        textAlign: 'start !important',
                        maxWidth: 320,
                        color: '#475569',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {req.description}
                    </Box>

                    {/* 6. Status Badge */}
                    <Box component="td">
                      <Chip
                        label={isAct ? 'نشط' : isNewReq ? 'جديد' : 'بانتظار التأكيد'}
                        size="small"
                        sx={{
                          bgcolor: isAct ? '#DCFCE7' : isNewReq ? '#E0F2FE' : '#FEF3C7',
                          color: isAct ? '#15803D' : isNewReq ? '#0284C7' : '#D97706',
                          fontWeight: 700,
                          fontSize: 12,
                          height: 24,
                          borderRadius: 1.5,
                        }}
                      />
                    </Box>

                    {/* 7. Actions Three Dots (Far Left) */}
                    <Box component="td" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, req)}
                        sx={{ color: '#94A3B8' }}
                      >
                        <Iconify icon="solar:menu-dots-bold" width={18} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredRequests.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Rows per page:"
          rowsPerPageOptions={[6, 12, 24]}
          sx={{
            borderTop: '1px solid #F1F5F9',
            '& .MuiTablePagination-toolbar': {
              minHeight: 52,
            },
          }}
        />
      </Card>

      {/* Row Action Popover Menu */}
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
            if (selectedRequest) {
              handleNavigateToDetails(selectedRequest.id);
            }
          }}
          sx={{ fontSize: 13.5, fontWeight: 600, gap: 1.5 }}
        >
          <Iconify icon="solar:eye-bold" width={18} sx={{ color: '#2563EB' }} />
          عرض تفاصيل الطلب
        </MenuItem>
      </Menu>
    </Box>
  );
}
