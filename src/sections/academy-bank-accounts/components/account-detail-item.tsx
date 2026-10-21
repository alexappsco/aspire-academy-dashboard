import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Props = { label: string; value?: string | null; ltr?: boolean };

export default function AccountDetailItem({ label, value, ltr = false }: Props) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 11, mb: 0.35 }}>{label}</Typography>
      <Typography
        dir={ltr ? 'ltr' : undefined}
        sx={{ fontSize: 13, fontWeight: 700, overflowWrap: 'anywhere' }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );
}
