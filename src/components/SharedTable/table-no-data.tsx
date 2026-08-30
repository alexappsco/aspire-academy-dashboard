import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Theme, SxProps } from '@mui/material/styles';

import EmptyContent from '../empty-content';
import { useTranslations } from 'next-intl';

// ----------------------------------------------------------------------

type Props = {
  notFound: boolean;
  sx?: SxProps<Theme>;
};

export default function TableNoData({ notFound, sx }: Props) {
  const t = useTranslations();
  if (!notFound) {
    return null;
  }
  return (
    <TableRow>
      <TableCell colSpan={12}>
        <EmptyContent
          filled
          title={t('Global.Label.no_data')}
          sx={{
            py: 10,
            ...sx,
          }}
        />
      </TableCell>
    </TableRow>
  );
}
