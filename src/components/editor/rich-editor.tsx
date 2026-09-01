'use client';

import React, { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

import Iconify from 'src/components/iconify';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
  minHeight?: number | string;
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder,
  dir = 'rtl',
  minHeight = 260,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontFamily, setFontFamily] = useState('Font');
  const [fontSize, setFontSize] = useState('16px');
  const [formatBlock, setFormatBlock] = useState('Normal');

  // Color picker popovers
  const [textColorAnchor, setTextColorAnchor] = useState<HTMLElement | null>(null);
  const [highlightColorAnchor, setHighlightColorAnchor] = useState<HTMLElement | null>(null);
  const [linkAnchor, setLinkAnchor] = useState<HTMLElement | null>(null);
  const [linkUrl, setLinkUrl] = useState('');

  // Synchronize external value with contentEditable without resetting cursor on every keystroke
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (onChange) {
        onChange(html);
      }
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (typeof document !== 'undefined') {
      document.execCommand(command, false, arg);
      handleContentChange();
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  };

  const handleFontChange = (e: SelectChangeEvent<string>) => {
    const font = e.target.value;
    setFontFamily(font);
    if (font !== 'Font') {
      executeCommand('fontName', font);
    }
  };

  const handleFontSizeChange = (e: SelectChangeEvent<string>) => {
    const size = e.target.value;
    setFontSize(size);
    // HTML font sizes map 1-7
    const sizeMap: Record<string, string> = {
      '12px': '1',
      '14px': '2',
      '16px': '3',
      '18px': '4',
      '20px': '5',
      '24px': '6',
      '32px': '7',
    };
    executeCommand('fontSize', sizeMap[size] || '3');
  };

  const handleFormatBlockChange = (e: SelectChangeEvent<string>) => {
    const format = e.target.value;
    setFormatBlock(format);
    if (format === 'Normal') {
      executeCommand('formatBlock', '<p>');
    } else if (format === 'H1') {
      executeCommand('formatBlock', '<h1>');
    } else if (format === 'H2') {
      executeCommand('formatBlock', '<h2>');
    } else if (format === 'H3') {
      executeCommand('formatBlock', '<h3>');
    }
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      executeCommand('createLink', linkUrl);
      setLinkUrl('');
    }
    setLinkAnchor(null);
  };

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
    '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
    '#1B8354', '#1C252E', '#637381', '#FFAB00', '#FF5630', '#00B8D9', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899',
  ];

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: '1px solid #E5E7EB',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Toolbar Header */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 0.5,
          p: 1,
          borderBottom: '1px solid #E5E7EB',
          bgcolor: '#FAFAFA',
        }}
      >
        {/* Font Family Dropdown */}
        <Select
          size="small"
          value={fontFamily}
          onChange={handleFontChange}
          IconComponent={UnfoldMoreIcon}
          sx={{
            height: 32,
            fontSize: '0.8125rem',
            color: '#1C252E',
            fontWeight: 500,
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: '#E5E7EB' },
            '&.Mui-focused fieldset': { borderColor: '#1B8354' },
          }}
        >
          <MenuItem value="Font">Font</MenuItem>
          <MenuItem value="Arial">Arial</MenuItem>
          <MenuItem value="Cairo">Cairo</MenuItem>
          <MenuItem value="IBM Plex Arabic">IBM Plex Arabic</MenuItem>
          <MenuItem value="Inter">Inter</MenuItem>
          <MenuItem value="Roboto">Roboto</MenuItem>
          <MenuItem value="Times New Roman">Times New Roman</MenuItem>
        </Select>

        {/* Font Size Dropdown */}
        <Select
          size="small"
          value={fontSize}
          onChange={handleFontSizeChange}
          IconComponent={UnfoldMoreIcon}
          sx={{
            height: 32,
            fontSize: '0.8125rem',
            color: '#1C252E',
            fontWeight: 500,
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: '#E5E7EB' },
            '&.Mui-focused fieldset': { borderColor: '#1B8354' },
          }}
        >
          <MenuItem value="12px">12px</MenuItem>
          <MenuItem value="14px">14px</MenuItem>
          <MenuItem value="16px">16px</MenuItem>
          <MenuItem value="18px">18px</MenuItem>
          <MenuItem value="20px">20px</MenuItem>
          <MenuItem value="24px">24px</MenuItem>
          <MenuItem value="32px">32px</MenuItem>
        </Select>

        {/* Format Block Dropdown */}
        <Select
          size="small"
          value={formatBlock}
          onChange={handleFormatBlockChange}
          IconComponent={UnfoldMoreIcon}
          sx={{
            height: 32,
            fontSize: '0.8125rem',
            color: '#1C252E',
            fontWeight: 500,
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: '#E5E7EB' },
            '&.Mui-focused fieldset': { borderColor: '#1B8354' },
          }}
        >
          <MenuItem value="Normal">Normal</MenuItem>
          <MenuItem value="H1">Heading 1</MenuItem>
          <MenuItem value="H2">Heading 2</MenuItem>
          <MenuItem value="H3">Heading 3</MenuItem>
        </Select>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        {/* Text Style Formats */}
        <Tooltip title="Bold (Ctrl+B)">
          <IconButton size="small" onClick={() => executeCommand('bold')}>
            <Iconify icon="lucide:bold" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Italic (Ctrl+I)">
          <IconButton size="small" onClick={() => executeCommand('italic')}>
            <Iconify icon="lucide:italic" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Underline (Ctrl+U)">
          <IconButton size="small" onClick={() => executeCommand('underline')}>
            <Iconify icon="lucide:underline" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Strikethrough">
          <IconButton size="small" onClick={() => executeCommand('strikeThrough')}>
            <Iconify icon="lucide:strikethrough" width={16} />
          </IconButton>
        </Tooltip>

        {/* Color picker button */}
        <Tooltip title="Text Color">
          <IconButton size="small" onClick={(e) => setTextColorAnchor(e.currentTarget)}>
            <Iconify icon="lucide:baseline" width={16} />
          </IconButton>
        </Tooltip>

        {/* Highlight color picker */}
        <Tooltip title="Highlight Color">
          <IconButton size="small" onClick={(e) => setHighlightColorAnchor(e.currentTarget)}>
            <Iconify icon="lucide:paint-bucket" width={16} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        {/* Lists & Indents */}
        <Tooltip title="Bullet List">
          <IconButton size="small" onClick={() => executeCommand('insertUnorderedList')}>
            <Iconify icon="lucide:list" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Numbered List">
          <IconButton size="small" onClick={() => executeCommand('insertOrderedList')}>
            <Iconify icon="lucide:list-ordered" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Decrease Indent">
          <IconButton size="small" onClick={() => executeCommand('outdent')}>
            <Iconify icon="lucide:outdent" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Increase Indent">
          <IconButton size="small" onClick={() => executeCommand('indent')}>
            <Iconify icon="lucide:indent" width={16} />
          </IconButton>
        </Tooltip>

        {/* Super / Sub scripts */}
        <Tooltip title="Superscript">
          <IconButton size="small" onClick={() => executeCommand('superscript')}>
            <Iconify icon="lucide:superscript" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Subscript">
          <IconButton size="small" onClick={() => executeCommand('subscript')}>
            <Iconify icon="lucide:subscript" width={16} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        {/* Code & Quote */}
        <Tooltip title="Code">
          <IconButton size="small" onClick={() => executeCommand('formatBlock', '<pre>')}>
            <Iconify icon="lucide:code" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Quote">
          <IconButton size="small" onClick={() => executeCommand('formatBlock', '<blockquote>')}>
            <Iconify icon="lucide:quote" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Paragraph">
          <IconButton size="small" onClick={() => executeCommand('formatBlock', '<p>')}>
            <Iconify icon="lucide:pilcrow" width={16} />
          </IconButton>
        </Tooltip>

        {/* Alignments */}
        <Tooltip title="Align Left">
          <IconButton size="small" onClick={() => executeCommand('justifyLeft')}>
            <Iconify icon="lucide:align-left" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Align Center">
          <IconButton size="small" onClick={() => executeCommand('justifyCenter')}>
            <Iconify icon="lucide:align-center" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Align Right">
          <IconButton size="small" onClick={() => executeCommand('justifyRight')}>
            <Iconify icon="lucide:align-right" width={16} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        {/* Media & Links */}
        <Tooltip title="Insert Link">
          <IconButton size="small" onClick={(e) => setLinkAnchor(e.currentTarget)}>
            <Iconify icon="lucide:link" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Insert Image">
          <IconButton size="small" onClick={handleInsertImage}>
            <Iconify icon="lucide:image" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Video">
          <IconButton size="small" onClick={() => {
            const videoUrl = prompt('Enter video URL:');
            if (videoUrl) {
              executeCommand('insertHTML', `<iframe width="420" height="315" src="${videoUrl}"></iframe>`);
            }
          }}>
            <Iconify icon="lucide:film" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Formula / Symbol">
          <IconButton size="small" onClick={() => executeCommand('insertHTML', '&Sigma;')}>
            <Iconify icon="lucide:sigma" width={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Clear Formatting">
          <IconButton size="small" onClick={() => executeCommand('removeFormat')}>
            <Iconify icon="lucide:eraser" width={16} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Editor Content Editable Area */}
      <Box
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        dir={dir}
        data-placeholder={placeholder}
        sx={{
          minHeight,
          p: 2.5,
          outline: 'none',
          fontSize: '0.9375rem',
          lineHeight: 1.8,
          color: '#1C252E',
          fontFamily: dir === 'rtl' ? '"IBM Plex Sans Arabic", Cairo, sans-serif' : 'Inter, Roboto, sans-serif',
          '&:empty:before': {
            content: 'attr(data-placeholder)',
            color: '#919EAB',
            pointerEvents: 'none',
          },
          '& blockquote': {
            borderInlineStart: '3px solid #1B8354',
            pl: 2,
            pr: 2,
            my: 1,
            color: '#637381',
            fontStyle: 'italic',
          },
          '& pre': {
            bgcolor: '#F4F6F8',
            p: 1.5,
            borderRadius: 1,
            fontFamily: 'monospace',
            overflowX: 'auto',
          },
          '& ul, & ol': {
            paddingInlineStart: '24px',
            my: 1,
          },
          '& h1, & h2, & h3': {
            fontWeight: 700,
            my: 1,
          },
        }}
      />

      {/* Text Color Popover */}
      <Popover
        open={Boolean(textColorAnchor)}
        anchorEl={textColorAnchor}
        onClose={() => setTextColorAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 1.5, display: 'grid', gridTemplateColumns: 'repeat(6, 24px)', gap: 0.75 }}>
          {colors.map((color) => (
            <Box
              key={color}
              onClick={() => {
                executeCommand('foreColor', color);
                setTextColorAnchor(null);
              }}
              sx={{
                width: 24,
                height: 24,
                bgcolor: color,
                borderRadius: '4px',
                cursor: 'pointer',
                border: '1px solid #E5E7EB',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            />
          ))}
        </Box>
      </Popover>

      {/* Highlight Color Popover */}
      <Popover
        open={Boolean(highlightColorAnchor)}
        anchorEl={highlightColorAnchor}
        onClose={() => setHighlightColorAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 1.5, display: 'grid', gridTemplateColumns: 'repeat(6, 24px)', gap: 0.75 }}>
          {colors.map((color) => (
            <Box
              key={color}
              onClick={() => {
                executeCommand('hiliteColor', color);
                setHighlightColorAnchor(null);
              }}
              sx={{
                width: 24,
                height: 24,
                bgcolor: color,
                borderRadius: '4px',
                cursor: 'pointer',
                border: '1px solid #E5E7EB',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            />
          ))}
        </Box>
      </Popover>

      {/* Link Popover */}
      <Popover
        open={Boolean(linkAnchor)}
        anchorEl={linkAnchor}
        onClose={() => setLinkAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, width: 280 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Insert Link</Typography>
          <TextField
            size="small"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            fullWidth
          />
          <Button variant="contained" size="small" onClick={handleInsertLink} sx={{ bgcolor: '#1C252E' }}>
            Add Link
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
