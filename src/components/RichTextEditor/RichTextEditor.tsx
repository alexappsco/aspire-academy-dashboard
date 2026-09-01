'use client';

import dynamic from 'next/dynamic';
import { Box, Typography } from '@mui/material';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
};

const modules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
};

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  dir = 'rtl',
}: RichTextEditorProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          mb: 1,
          color: '#637381',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          '& .ql-toolbar.ql-snow': {
            borderRadius: '12px 12px 0 0',
            borderColor: '#E5E7EB',
            bgcolor: '#FAFAFA',
          },
          '& .ql-container.ql-snow': {
            borderRadius: '0 0 12px 12px',
            borderColor: '#E5E7EB',
            minHeight: 220,
            fontFamily: 'inherit',
            fontSize: '0.9375rem',
          },
          '& .ql-editor': {
            minHeight: 220,
            textAlign: dir === 'rtl' ? 'right' : 'left',
            direction: dir,
          },
        }}
      >
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
          theme="snow"
        />
      </Box>
    </Box>
  );
}
