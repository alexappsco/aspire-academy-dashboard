'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import InputBase from '@mui/material/InputBase';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { getSocials, createSocial, updateSocial, deleteSocial } from 'src/actions/socials';
import type { SocialItem } from 'src/types/social';

export interface SocialPlatformConfig {
  key: string;
  name: string;
  icon: string;
  iconify: string;
  circleBg: string;
  iconColor: string;
  placeholder: string;
  type: 'tel' | 'email' | 'url';
}

export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    key: 'phone',
    name: 'Phone Number',
    icon: 'phone',
    iconify: 'ic:baseline-phone',
    circleBg: '#1E293B',
    iconColor: '#FFFFFF',
    placeholder: '+966 22 333 4444',
    type: 'tel',
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    icon: 'whatsapp',
    iconify: 'ri:whatsapp-fill',
    circleBg: '#25D366',
    iconColor: '#FFFFFF',
    placeholder: '+966 22 333 4444',
    type: 'tel',
  },
  {
    key: 'email',
    name: 'E-mail',
    icon: 'email',
    iconify: 'ic:round-email',
    circleBg: '#D32F2F',
    iconColor: '#FFFFFF',
    placeholder: 'example@gmail.com',
    type: 'email',
  },
  {
    key: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    iconify: 'ri:facebook-fill',
    circleBg: '#1877F2',
    iconColor: '#FFFFFF',
    placeholder: 'https://facebook.com/example',
    type: 'url',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    iconify: 'ri:instagram-fill',
    circleBg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    iconColor: '#FFFFFF',
    placeholder: 'https://instagram.com/example',
    type: 'url',
  },
  {
    key: 'telegram',
    name: 'Telegram',
    icon: 'telegram',
    iconify: 'ri:telegram-fill',
    circleBg: '#229ED9',
    iconColor: '#FFFFFF',
    placeholder: 'https://t.me/example',
    type: 'url',
  },
  {
    key: 'snapchat',
    name: 'Snapchat',
    icon: 'snapchat',
    iconify: 'ri:snapchat-fill',
    circleBg: '#FFFC00',
    iconColor: '#000000',
    placeholder: 'https://snapchat.com/add/example',
    type: 'url',
  },
  {
    key: 'tiktok',
    name: 'TikTok',
    icon: 'tiktok',
    iconify: 'ri:tiktok-fill',
    circleBg: '#000000',
    iconColor: '#FFFFFF',
    placeholder: 'https://tiktok.com/@example',
    type: 'url',
  },
];

export function getPlatformConfig(nameOrIcon?: string): SocialPlatformConfig {
  if (!nameOrIcon) return SOCIAL_PLATFORMS[0];
  const query = nameOrIcon.toLowerCase().trim();
  const found = SOCIAL_PLATFORMS.find(
    (p) =>
      p.key.toLowerCase() === query ||
      p.name.toLowerCase() === query ||
      p.icon.toLowerCase() === query
  );
  return (
    found || {
      key: 'custom',
      name: nameOrIcon,
      icon: nameOrIcon,
      iconify: 'solar:link-bold',
      circleBg: '#475467',
      iconColor: '#FFFFFF',
      placeholder: 'https://...',
      type: 'url',
    }
  );
}

interface EditableSocialItem {
  localId: string;
  id?: string;
  name: string;
  icon: string;
  url: string;
  originalUrl?: string;
}

export default function ContactUsView() {
  const t = useTranslations('ContactUs');
  const toast = useToast();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [items, setItems] = useState<EditableSocialItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Popover state for '+' button
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);

  // Fetch socials from backend on mount
  const fetchSocials = async () => {
    setLoading(true);
    try {
      const res = await getSocials();
      if (res.success && res.data) {
        setItems(
          res.data.map((item) => ({
            localId: item.id,
            id: item.id,
            name: item.name,
            icon: item.icon,
            url: item.url || '',
            originalUrl: item.url || '',
          }))
        );
        setDeletedIds([]);
      }
    } catch {
      toast.error(t('save_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Count added items per platform
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      const cfg = getPlatformConfig(item.icon || item.name);
      counts[cfg.key] = (counts[cfg.key] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Handle open/close '+' popover
  const handleOpenAddPopover = (event: React.MouseEvent<HTMLElement>) => {
    setPopoverAnchor(event.currentTarget);
  };

  const handleCloseAddPopover = () => {
    setPopoverAnchor(null);
  };

  // Add platform item
  const handleSelectPlatform = (platform: SocialPlatformConfig) => {
    const newItem: EditableSocialItem = {
      localId: `new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: platform.name,
      icon: platform.icon,
      url: '',
      originalUrl: '',
    };
    setItems((prev) => [...prev, newItem]);
    handleCloseAddPopover();
  };

  // Update row value
  const handleValueChange = (localId: string, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, url: value } : item))
    );
  };

  // Remove row
  const handleDeleteRow = (localId: string) => {
    const target = items.find((item) => item.localId === localId);
    if (target?.id) {
      setDeletedIds((prev) => [...prev, target.id!]);
    }
    setItems((prev) => prev.filter((item) => item.localId !== localId));
  };

  // Save all changes
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // 1. Delete removed items
      for (const id of deletedIds) {
        await deleteSocial(id);
      }

      // 2. Update existing items if changed
      for (const item of items) {
        if (item.id) {
          if (item.url !== item.originalUrl) {
            await updateSocial(item.id, {
              name: item.name,
              icon: item.icon,
              url: item.url.trim(),
            });
          }
        } else {
          // 3. Create new items with non-empty url
          if (item.url.trim()) {
            await createSocial({
              name: item.name,
              icon: item.icon,
              url: item.url.trim(),
            });
          }
        }
      }

      toast.success(t('save_success'));
      await fetchSocials();
    } catch {
      toast.error(t('save_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ py: 3, maxWidth: 1100, mx: 'auto' }}>
      {/* 1. Top Header: Title + Save Changes Button */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E' }}>
          {t('title')}
        </Typography>

        <Button
          variant="contained"
          onClick={handleSaveChanges}
          disabled={saving || loading}
          startIcon={
            saving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Iconify icon="solar:check-read-bold" width={18} />
            )
          }
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 3.5,
            py: 1.1,
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#2C353E' },
            '&.Mui-disabled': {
              bgcolor: '#94A3B8',
              color: '#F8FAFC',
            },
          }}
        >
          {t('save_changes')}
        </Button>
      </Stack>

      {/* 2. Main White Card */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          p: { xs: 2.5, sm: 4 },
          bgcolor: '#FFFFFF',
          minHeight: 400,
        }}
      >
        {/* Card Header: "وسائل التواصل المضافة" on Right + "+" Button on Left */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3.5,
          }}
        >
          {/* Big Plus Button */}
          <IconButton
            onClick={handleOpenAddPopover}
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              bgcolor: '#1C252E',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(28, 37, 46, 0.15)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#2C353E',
                transform: 'scale(1.03)',
              },
            }}
          >
            <Iconify icon="mingcute:add-line" width={26} />
          </IconButton>

          {/* Section Heading */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#2D5A43',
              fontSize: '1.1rem',
            }}
          >
            {t('added_channels')}
          </Typography>
        </Box>

        {/* Loading Spinner */}
        {loading ? (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={36} sx={{ color: '#1C252E' }} />
          </Box>
        ) : items.length === 0 ? (
          /* Empty State */
          <Box
            sx={{
              py: 8,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
              }}
            >
              <Iconify icon="solar:chat-round-line-bold" width={32} />
            </Box>
            <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
              {t('empty_state')}
            </Typography>
          </Box>
        ) : (
          /* 3. List of Added Social Rows (Matching Image 3) */
          <Stack spacing={2.5}>
            {items.map((item) => {
              const platform = getPlatformConfig(item.icon || item.name);

              return (
                <Box
                  key={item.localId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    direction: isRtl ? 'rtl' : 'ltr',
                  }}
                >
                  {/* Delete Button (Left side in RTL) */}
                  <Tooltip title={t('delete_channel')}>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteRow(item.localId)}
                      sx={{
                        color: '#94A3B8',
                        transition: 'all 0.2s',
                        '&:hover': {
                          color: '#E53935',
                          bgcolor: '#FEE2E2',
                        },
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                    </IconButton>
                  </Tooltip>

                  {/* Input Pill Container */}
                  <Box
                    sx={{
                      flex: 1,
                      height: 48,
                      bgcolor: '#EAEFF2',
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      px: 2.5,
                      border: '1px solid transparent',
                      transition: 'all 0.15s ease',
                      '&:focus-within': {
                        borderColor: '#CBD5E1',
                        bgcolor: '#F1F5F8',
                      },
                    }}
                  >
                    <InputBase
                      fullWidth
                      value={item.url}
                      onChange={(e) => handleValueChange(item.localId, e.target.value)}
                      placeholder={platform.placeholder}
                      type={platform.type === 'tel' ? 'tel' : 'text'}
                      inputProps={{
                        style: {
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#1E293B',
                          direction: isRtl ? 'rtl' : 'ltr',
                          textAlign: isRtl ? 'right' : 'left',
                        },
                      }}
                      sx={{ width: '100%' }}
                    />
                  </Box>

                  {/* Circular Icon Badge (Right side in RTL) */}
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: platform.circleBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: platform.iconColor,
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    }}
                  >
                    <Iconify icon={platform.iconify} width={22} />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Card>

      {/* 4. '+' Dropdown Menu Popover (Matching Image 4) */}
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handleCloseAddPopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isRtl ? 'right' : 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: isRtl ? 'right' : 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 270,
              borderRadius: 2.5,
              boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.12)',
              p: 1.5,
              mt: 1,
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <Stack spacing={0.5}>
          {SOCIAL_PLATFORMS.map((platform) => {
            const count = platformCounts[platform.key] || 0;
            const alreadyAdded = count > 0;

            return (
              <Box
                key={platform.key}
                onClick={() => handleSelectPlatform(platform)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    bgcolor: '#F8FAFC',
                  },
                }}
              >
                {/* Platform Circular Icon */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: platform.circleBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: platform.iconColor,
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <Iconify icon={platform.iconify} width={18} />
                </Box>

                {/* Platform Name + Subtext */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#1E293B',
                      fontSize: 13.5,
                      lineHeight: 1.2,
                    }}
                  >
                    {platform.name}
                  </Typography>

                  {alreadyAdded && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94A3B8',
                        fontSize: 11,
                        display: 'block',
                        mt: 0.25,
                      }}
                    >
                      {t('already_added_one')}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Popover>
    </Box>
  );
}
