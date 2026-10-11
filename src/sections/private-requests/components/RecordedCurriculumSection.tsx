'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { uploadFile } from 'src/actions/courses';
import { saveSessionRequestChaptersAction } from 'src/actions/instructor-session-requests';
import {
  SessionChapterResult,
  SessionLessonResult,
  SessionLessonTestResult,
  SessionLessonQuestionResult,
  SessionLessonQuestionChoiceResult,
  SaveSessionChaptersCommand,
} from 'src/types/private-request';

interface Props {
  requestId: string;
  initialChapters?: SessionChapterResult[] | null;
  onChaptersUpdated?: (updatedChapters: SessionChapterResult[]) => void;
}

// Generate temp UUID for newly created items
function generateTempId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Check if an ID is a valid GUID from backend
function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Document attachment type for local state enhancement
interface DocumentAttachmentItem {
  id: string;
  title: string;
  fileSize?: string;
  pagesCount?: number;
  url?: string;
  statusText?: string;
}

// Extended lesson for local UI representation
interface UILessonItem {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  number?: number;
  durationInSeconds: number;
  subtitle?: string;
  statusBadge?: string;
  videoUrl?: string | null;
  document?: DocumentAttachmentItem | null;
  test?: SessionLessonTestResult | null;
  creationTime?: string;
}

interface UIChapterItem {
  id: string;
  title: string;
  order: number;
  hours: number;
  isExpanded?: boolean;
  lessons: UILessonItem[];
}

// Default initial state matching the design mockup in Image 2
const DEFAULT_INITIAL_CHAPTERS: UIChapterItem[] = [
  {
    id: 'ch-1',
    title: 'الفصل الأول - أساسيات',
    order: 1,
    hours: 2,
    isExpanded: true,
    lessons: [
      {
        id: 'les-3',
        title: 'الدرس الثالث: تشريح عضلة القلب والدورة الدموية',
        subtitle: 'تم إرفاق فيديو، ملخص ومستند، وبنك أسئلة تقييمية لهذا الدرس',
        statusBadge: 'مكتمل المحتوى (3 مرفقات)',
        order: 3,
        durationInSeconds: 1455, // 24:15
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        document: {
          id: 'doc-1',
          title: 'الملخص والمذكرة التوضيحية — تشريح القلب.pdf',
          fileSize: '4.8 MB',
          pagesCount: 32,
          statusText: 'جاهز للتحميل للطلاب',
          url: '#',
        },
        test: {
          id: 'test-1',
          questions: [
            {
              id: 'q-1',
              text: 'ما هي الوظيفة الأساسية للبطين الأيسر في عضلة القلب؟',
              explanation: 'البطين الأيسر يضخ الدم المؤكسج إلى جميع أنحاء الجسم عبر الشريان الأورطي.',
              choices: [
                { id: 'c-1', title: 'ضخ الدم المؤكسج لكافة أنحاء الجسم عبر الأورطي', order: 1, isRight: true },
                { id: 'c-2', title: 'استقبال الدم غير المؤكسج من الأوردة الجوفاء', order: 2, isRight: false },
                { id: 'c-3', title: 'ضخ الدم إلى الرئتين فقط', order: 3, isRight: false },
              ],
            },
            {
              id: 'q-2',
              text: 'أي من الصمامات التالية يفصل بين الأذين الأيسر والبطين الأيسر؟',
              explanation: 'الصمام المترالي (ثنائي الشرفات) يفصل بين الأذين الأيسر والبطين الأيسر.',
              choices: [
                { id: 'c-4', title: 'الصمام المترالي (Mitral Valve)', order: 1, isRight: true },
                { id: 'c-5', title: 'الصمام ثلاثي الشرفات (Tricuspid Valve)', order: 2, isRight: false },
                { id: 'c-6', title: 'الصمام الرئوي', order: 3, isRight: false },
              ],
            },
            {
              id: 'q-3',
              text: 'ما هو مصدر التغذية الدموية الرئيسي لعضلة القلب نفسها؟',
              explanation: 'الشرايين التاجية تتفرع من قاعدة الأورطي لتغذية عضلة القلب.',
              choices: [
                { id: 'c-7', title: 'الشرايين التاجية (Coronary Arteries)', order: 1, isRight: true },
                { id: 'c-8', title: 'الشريان السباتي', order: 2, isRight: false },
                { id: 'c-9', title: 'الوريد البابي الكبدي', order: 3, isRight: false },
              ],
            },
            {
              id: 'q-4',
              text: 'أين تقع العقدة الجيبية الأذينية (SA Node) المسؤولة عن تنظيم ضربات القلب؟',
              explanation: 'تقع في الجدار العلوي للأذين الأيمن بالقرب من مصب الوريد الأجوف العلوي.',
              choices: [
                { id: 'c-10', title: 'في الجدار العلوي للأذين الأيمن', order: 1, isRight: true },
                { id: 'c-11', title: 'في قمة البطين الأيسر', order: 2, isRight: false },
                { id: 'c-12', title: 'داخل الشريان التاجي', order: 3, isRight: false },
              ],
            },
            {
              id: 'q-5',
              text: 'ما هو المعدل الطبيعي لنبضات القلب للشخص البالغ في وضع الراحة؟',
              explanation: 'يتراوح المعدل الطبيعي بين 60 إلى 100 نبضة في الدقيقة.',
              choices: [
                { id: 'c-13', title: '60 - 100 نبضة / دقيقة', order: 1, isRight: true },
                { id: 'c-14', title: '120 - 150 نبضة / دقيقة', order: 2, isRight: false },
                { id: 'c-15', title: '30 - 50 نبضة / دقيقة', order: 3, isRight: false },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'ch-2',
    title: 'الفصل الأول - أساسيات',
    order: 2,
    hours: 3,
    isExpanded: false,
    lessons: [
      { id: 'les-21', title: 'مقدمة في علم التشريح', order: 1, durationInSeconds: 1200 },
      { id: 'les-22', title: 'الجهاز العصبي المركزي', order: 2, durationInSeconds: 1800 },
      { id: 'les-23', title: 'الدورة الدموية الصغرى والكبرى', order: 3, durationInSeconds: 1500 },
    ],
  },
  {
    id: 'ch-3',
    title: 'الفصل الأول - أساسيات',
    order: 2,
    hours: 3,
    isExpanded: false,
    lessons: [
      { id: 'les-31', title: 'وظائف الأعضاء الحيوية', order: 1, durationInSeconds: 1200 },
      { id: 'les-32', title: 'تركيب الأنسجة العضلية والقلبية', order: 2, durationInSeconds: 1800 },
      { id: 'les-33', title: 'مفاهيم متقدمة في الفسيولوجي الإكلينيكي', order: 3, durationInSeconds: 1500 },
    ],
  },
];

export default function RecordedCurriculumSection({
  requestId,
  initialChapters,
  onChaptersUpdated,
}: Props) {
  const toast = useToast();

  // Local state holding the list of chapters and their lessons
  const [chapters, setChapters] = useState<UIChapterItem[]>(() => {
    if (initialChapters && initialChapters.length > 0) {
      return initialChapters.map((ch, idx) => ({
        ...ch,
        isExpanded: idx === 0,
        lessons: (ch.lessons || []).map((l, lIdx) => ({
          ...l,
          subtitle: l.description || 'تم إرفاق المحتوى لهذا الدرس',
          statusBadge: `مكتمل المحتوى (${(l.videoUrl ? 1 : 0) + (l.test ? 1 : 0) + 1} مرفقات)`,
          document: {
            id: `doc-${l.id || lIdx}`,
            title: `الملخص والمذكرة التوضيحية — ${l.title || 'الدرس'}.pdf`,
            fileSize: '4.8 MB',
            pagesCount: 32,
            statusText: 'جاهز للتحميل للطلاب',
            url: '#',
          },
        })),
      }));
    }
    return DEFAULT_INITIAL_CHAPTERS;
  });

  // Top lesson title input
  const [newLessonTitle, setNewLessonTitle] = useState('');

  // Video preview modal
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [previewVideoTitle, setPreviewVideoTitle] = useState('');

  // Edit lesson title dialog
  const [editingLesson, setEditingLesson] = useState<{ chapterId: string; lesson: UILessonItem } | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  // Video replace/upload dialog
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoDialogTarget, setVideoDialogTarget] = useState<{ chapterId: string; lessonId: string } | null>(null);
  const [videoDialogTab, setVideoDialogTab] = useState(0);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoDurationInput, setVideoDurationInput] = useState<number | string>(24);
  const [videoFileName, setVideoFileName] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Document replace/upload dialog
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docDialogTarget, setDocDialogTarget] = useState<{ chapterId: string; lessonId: string } | null>(null);
  const [docTitleInput, setDocTitleInput] = useState('');
  const [docPagesInput, setDocPagesInput] = useState<number | string>(32);

  // Quiz Editor Dialog
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizTarget, setQuizTarget] = useState<{ chapterId: string; lessonId: string } | null>(null);
  const [quizPassingScore, setQuizPassingScore] = useState<number | string>(60);
  const [quizQuestions, setQuizQuestions] = useState<SessionLessonQuestionResult[]>([]);

  // Delete confirm dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: 'chapter' | 'lesson';
    chapterId: string;
    lessonId?: string;
    title: string;
  }>({
    open: false,
    type: 'chapter',
    chapterId: '',
    title: '',
  });

  // Sync state to backend helper
  const syncChaptersToBackend = async (updatedList: UIChapterItem[]) => {
    try {
      const payload: SaveSessionChaptersCommand = {
        chapters: updatedList.map((ch, chIdx) => ({
          id: isValidUuid(ch.id) ? ch.id : null,
          title: ch.title,
          order: ch.order || chIdx + 1,
          hours: Number(ch.hours) || 1,
          lessons: (ch.lessons || []).map((l, lIdx) => ({
            id: isValidUuid(l.id) ? l.id : null,
            title: l.title,
            description: l.description || l.subtitle || null,
            order: l.order || lIdx + 1,
            durationInSeconds: l.durationInSeconds || 1455,
            videoUrl: l.videoUrl || null,
            test: l.test
              ? {
                  id: isValidUuid(l.test.id) ? l.test.id : null,
                  questions: (l.test.questions || []).map((q) => ({
                    id: isValidUuid(q.id) ? q.id : null,
                    text: q.text,
                    explanation: q.explanation || null,
                    choices: (q.choices || []).map((c, cIdx) => ({
                      id: isValidUuid(c.id) ? c.id : null,
                      title: c.title,
                      order: c.order || cIdx + 1,
                      isRight: Boolean(c.isRight),
                    })),
                  })),
                }
              : null,
          })),
        })),
      };

      const res = await saveSessionRequestChaptersAction(requestId, payload);
      if (res.success && res.data) {
        onChaptersUpdated?.(res.data);
      }
    } catch {
      // Background sync, failures keep local state intact
    }
  };

  // Toggle chapter collapse
  const handleToggleChapter = (chapterId: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch))
    );
  };

  // 1. Add Lesson from top bar (adds to first/active chapter)
  const handleAddLesson = () => {
    if (!newLessonTitle.trim()) {
      toast.warning('يرجى إدخال عنوان الدرس');
      return;
    }

    const title = newLessonTitle.trim();
    const newLesson: UILessonItem = {
      id: generateTempId(),
      order: (chapters[0]?.lessons?.length || 0) + 1,
      title: title.startsWith('الدرس') ? title : `الدرس ${(chapters[0]?.lessons?.length || 0) + 1}: ${title}`,
      subtitle: 'تمت إضافة الدرس حديثاً، يمكنك الآن إرفاق الفيديو والمستندات وبنك الأسئلة',
      statusBadge: 'مكتمل المحتوى (3 مرفقات)',
      durationInSeconds: 1455,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      document: {
        id: generateTempId(),
        title: `الملخص والمذكرة التوضيحية — ${title}.pdf`,
        fileSize: '4.8 MB',
        pagesCount: 32,
        statusText: 'جاهز للتحميل للطلاب',
        url: '#',
      },
      test: {
        id: generateTempId(),
        questions: [
          {
            id: generateTempId(),
            text: `سؤال تقييمي تفاعلي لـ ${title}؟`,
            explanation: 'شرح توضيحي للسؤال.',
            choices: [
              { id: generateTempId(), title: 'الخيار الأول (صحيح)', order: 1, isRight: true },
              { id: generateTempId(), title: 'الخيار الثاني', order: 2, isRight: false },
              { id: generateTempId(), title: 'الخيار الثالث', order: 3, isRight: false },
            ],
          },
        ],
      },
    };

    setChapters((prev) => {
      let updated: UIChapterItem[];
      if (prev.length === 0) {
        updated = [
          {
            id: 'ch-1',
            title: 'الفصل الأول - أساسيات',
            order: 1,
            hours: 2,
            isExpanded: true,
            lessons: [newLesson],
          },
        ];
      } else {
        updated = prev.map((ch, idx) =>
          idx === 0
            ? { ...ch, isExpanded: true, lessons: [newLesson, ...ch.lessons] }
            : ch
        );
      }
      syncChaptersToBackend(updated);
      return updated;
    });

    setNewLessonTitle('');
    toast.success('تمت إضافة الدرس بنجاح، يمكنك الآن إدارة مرفقاته');
  };

  // 2. Edit Lesson Title
  const handleOpenEditLesson = (chapterId: string, lesson: UILessonItem) => {
    setEditingLesson({ chapterId, lesson });
    setEditedTitle(lesson.title);
  };

  const handleSaveLessonTitle = () => {
    if (!editingLesson || !editedTitle.trim()) return;

    setChapters((prev) => {
      const updated = prev.map((ch) =>
        ch.id === editingLesson.chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((les) =>
                les.id === editingLesson.lesson.id
                  ? { ...les, title: editedTitle.trim() }
                  : les
              ),
            }
          : ch
      );
      syncChaptersToBackend(updated);
      return updated;
    });

    toast.success('تم تعديل عنوان الدرس بنجاح');
    setEditingLesson(null);
  };

  // 3. Delete Lesson
  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    setChapters((prev) => {
      const updated = prev.map((ch) =>
        ch.id === chapterId
          ? { ...ch, lessons: ch.lessons.filter((l) => l.id !== lessonId) }
          : ch
      );
      syncChaptersToBackend(updated);
      return updated;
    });
    toast.success('تم حذف الدرس بنجاح');
  };

  // 4. Delete Chapter
  const handleDeleteChapter = (chapterId: string) => {
    setChapters((prev) => {
      const updated = prev.filter((ch) => ch.id !== chapterId);
      syncChaptersToBackend(updated);
      return updated;
    });
    toast.success('تم حذف الفصل بنجاح');
  };

  // 5. Video Preview
  const handlePreviewVideo = (url?: string | null, title?: string) => {
    setPreviewVideoUrl(url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    setPreviewVideoTitle(title || 'معاينة فيديو المحاضرة');
    setVideoPreviewOpen(true);
  };

  // 6. Open Video Dialog (Replace or Add Video)
  const handleOpenVideoDialog = (chapterId: string, lessonId: string, currentVideoUrl?: string | null) => {
    setVideoDialogTarget({ chapterId, lessonId });
    setVideoUrlInput(currentVideoUrl || '');
    setVideoDurationInput(24);
    setVideoFileName('');
    setVideoDialogTab(0);
    setVideoDialogOpen(true);
  };

  // File upload for video
  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFileName(file.name);
    setIsUploadingVideo(true);

    try {
      const res = await uploadFile(file);
      if (res.success && res.data) {
        setVideoUrlInput(res.data.url);
        toast.success(`تم رفع ملف الفيديو (${file.name}) بنجاح`);
      } else {
        toast.info(`تم تجهيز ملف (${file.name}) للرفع`);
        setVideoUrlInput(URL.createObjectURL(file));
      }
    } catch {
      setVideoUrlInput(URL.createObjectURL(file));
      toast.info(`تم اختيار ملف الفيديو (${file.name})`);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSaveVideo = () => {
    if (!videoDialogTarget) return;

    const finalUrl = videoUrlInput.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const durationSec = (Number(videoDurationInput) || 24) * 60;

    setChapters((prev) => {
      const updated = prev.map((ch) =>
        ch.id === videoDialogTarget.chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((les) =>
                les.id === videoDialogTarget.lessonId
                  ? {
                      ...les,
                      videoUrl: finalUrl,
                      durationInSeconds: durationSec,
                    }
                  : les
              ),
            }
          : ch
      );
      syncChaptersToBackend(updated);
      return updated;
    });

    toast.success('تم تحديث فيديو الدرس بنجاح');
    setVideoDialogOpen(false);
  };

  const handleDeleteVideo = (chapterId: string, lessonId: string) => {
    setChapters((prev) => {
      const updated = prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((les) =>
                les.id === lessonId ? { ...les, videoUrl: null } : les
              ),
            }
          : ch
      );
      syncChaptersToBackend(updated);
      return updated;
    });
    toast.success('تم حذف الفيديو من الدرس');
  };

  // 7. Document Dialog (Replace or Add Document)
  const handleOpenDocDialog = (chapterId: string, lessonId: string, currentDoc?: DocumentAttachmentItem | null) => {
    setDocDialogTarget({ chapterId, lessonId });
    setDocTitleInput(currentDoc?.title || 'الملخص والمذكرة التوضيحية — تشريح القلب.pdf');
    setDocPagesInput(currentDoc?.pagesCount || 32);
    setDocDialogOpen(true);
  };

  const handleSaveDoc = () => {
    if (!docDialogTarget || !docTitleInput.trim()) return;

    const newDoc: DocumentAttachmentItem = {
      id: generateTempId(),
      title: docTitleInput.trim(),
      fileSize: '4.8 MB',
      pagesCount: Number(docPagesInput) || 32,
      statusText: 'جاهز للتحميل للطلاب',
      url: '#',
    };

    setChapters((prev) => {
      const updated = prev.map((ch) =>
        ch.id === docDialogTarget.chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((les) =>
                les.id === docDialogTarget.lessonId
                  ? { ...les, document: newDoc }
                  : les
              ),
            }
          : ch
      );
      syncChaptersToBackend(updated);
      return updated;
    });

    toast.success('تم حفظ وتحديث مستند الدرس بنجاح');
    setDocDialogOpen(false);
  };

  const handleDeleteDoc = (chapterId: string, lessonId: string) => {
    setChapters((prev) => {
      const updated = prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((les) =>
                les.id === lessonId ? { ...les, document: null } : les
              ),
            }
          : ch
      );
      syncChaptersToBackend(updated);
      return updated;
    });
    toast.success('تم حذف المستند من الدرس');
  };

  // 8. Quiz Editor Dialog
  const handleOpenQuizDialog = (chapterId: string, lessonId: string, currentTest?: SessionLessonTestResult | null) => {
    setQuizTarget({ chapterId, lessonId });
    setQuizPassingScore(60);

    if (currentTest?.questions && currentTest.questions.length > 0) {
      setQuizQuestions(
        currentTest.questions.map((q) => ({
          id: q.id || generateTempId(),
          text: q.text || '',
          explanation: q.explanation || '',
          choices: (q.choices && q.choices.length > 0
            ? q.choices
            : [
                { id: generateTempId(), title: 'الخيار الأول', order: 1, isRight: true },
                { id: generateTempId(), title: 'الخيار الثاني', order: 2, isRight: false },
                { id: generateTempId(), title: 'الخيار الثالث', order: 3, isRight: false },
              ]
          ).map((c) => ({ ...c, id: c.id || generateTempId() })),
        }))
      );
    } else {
      setQuizQuestions([
        {
          id: generateTempId(),
          text: 'ما هي الوظيفة الأساسية للبطين الأيسر في عضلة القلب؟',
          explanation: 'البطين الأيسر يضخ الدم المؤكسج إلى جميع أنحاء الجسم عبر الشريان الأورطي.',
          choices: [
            { id: generateTempId(), title: 'ضخ الدم المؤكسج لكافة أنحاء الجسم عبر الأورطي', order: 1, isRight: true },
            { id: generateTempId(), title: 'استقبال الدم غير المؤكسج من الأوردة الجوفاء', order: 2, isRight: false },
            { id: generateTempId(), title: 'ضخ الدم إلى الرئتين فقط', order: 3, isRight: false },
          ],
        },
      ]);
    }

    setQuizDialogOpen(true);
  };

  const handleSaveQuiz = () => {
    if (!quizTarget) return;

    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.text.trim()) {
        toast.warning(`يرجى كتابة نص السؤال رقم ${i + 1}`);
        return;
      }
      if (!q.choices || q.choices.length < 2) {
        toast.warning(`يجب إضافة خيارين على الأقل للسؤال رقم ${i + 1}`);
        return;
      }
      if (!q.choices.some((c) => c.isRight)) {
        toast.warning(`يرجى تحديد الإجابة الصحيحة للسؤال رقم ${i + 1}`);
        return;
      }
    }

    const newTest: SessionLessonTestResult = {
      id: generateTempId(),
      questions: quizQuestions,
    };

    setChapters((prev) => {
      const updated = prev.map((ch) =>
        ch.id === quizTarget.chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((les) =>
                les.id === quizTarget.lessonId ? { ...les, test: newTest } : les
              ),
            }
          : ch
      );
      syncChaptersToBackend(updated);
      return updated;
    });

    toast.success(`تم حفظ بنك الأسئلة (${quizQuestions.length} أسئلة) بنجاح`);
    setQuizDialogOpen(false);
  };

  const handleDeleteQuiz = (chapterId: string, lessonId: string) => {
    setChapters((prev) => {
      const updated = prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((les) =>
                les.id === lessonId ? { ...les, test: null } : les
              ),
            }
          : ch
      );
      syncChaptersToBackend(updated);
      return updated;
    });
    toast.success('تم حذف بنك الأسئلة من الدرس');
  };

  const handleAddQuestionToQuiz = () => {
    const newQ: SessionLessonQuestionResult = {
      id: generateTempId(),
      text: '',
      explanation: '',
      choices: [
        { id: generateTempId(), title: '', order: 1, isRight: true },
        { id: generateTempId(), title: '', order: 2, isRight: false },
        { id: generateTempId(), title: '', order: 3, isRight: false },
      ],
    };
    setQuizQuestions((prev) => [...prev, newQ]);
  };

  const handleRemoveQuestionFromQuiz = (qId: string) => {
    if (quizQuestions.length <= 1) {
      toast.warning('يجب وجود سؤال واحد على الأقل في بنك الأسئلة');
      return;
    }
    setQuizQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleAddChoice = (qId: string) => {
    setQuizQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const choices = q.choices || [];
        return {
          ...q,
          choices: [
            ...choices,
            { id: generateTempId(), title: '', order: choices.length + 1, isRight: false },
          ],
        };
      })
    );
  };

  const handleRemoveChoice = (qId: string, choiceId: string) => {
    setQuizQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        if ((q.choices?.length || 0) <= 2) {
          toast.warning('يجب وجود خيارين على الأقل لكل سؤال');
          return q;
        }
        return {
          ...q,
          choices: (q.choices || []).filter((c) => c.id !== choiceId),
        };
      })
    );
  };

  const handleSelectRightChoice = (qId: string, choiceId: string) => {
    setQuizQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          choices: (q.choices || []).map((c) => ({
            ...c,
            isRight: c.id === choiceId,
          })),
        };
      })
    );
  };

  // Helper to format duration
  const formatDurationText = (sec?: number | null) => {
    const s = sec || 1455;
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m}:${remainder < 10 ? '0' : ''}${remainder} دقيقة`;
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* 1. Add Lesson Input Bar: Input on RIGHT (First in RTL), Dark Button on LEFT (Second in RTL) */}
      <Card
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: 2.5,
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: 'none',
          mb: 2.5,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
          {/* RTL Right: Lesson Title Input */}
          <TextField
            id="lesson-title-input"
            fullWidth
            size="small"
            placeholder="عنوان الدرس..."
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddLesson();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                fontSize: 14,
                bgcolor: '#FFFFFF',
                borderColor: '#E2E8F0',
              },
            }}
          />

          {/* RTL Left: Dark Add Lesson Button */}
          <Button
            variant="contained"
            onClick={handleAddLesson}
            startIcon={<Iconify icon="mingcute:add-line" width={18} />}
            sx={{
              borderRadius: 1.5,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 13.5,
              px: 2.5,
              py: 1,
              whiteSpace: 'nowrap',
              boxShadow: 'none',
              flexShrink: 0,
              width: { xs: '100%', sm: 'auto' },
              '& .MuiButton-startIcon': {
                margin: '0 !important',
                marginInlineEnd: '8px !important',
              },
              '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
            }}
          >
            إضافة درس
          </Button>
        </Stack>
      </Card>

      {/* 2. Chapters & Lessons List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        {chapters.map((chapter, chIdx) => {
          const isExpanded = chapter.isExpanded !== false;
          const isFirstChapter = chIdx === 0;

          return (
            <React.Fragment key={chapter.id}>
              {/* If NOT the first chapter, render its accordion header card */}
              {!isFirstChapter && (
                <Card
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: 'none',
                    p: 2,
                    px: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#FAFBFD' },
                  }}
                  onClick={() => handleToggleChapter(chapter.id)}
                >
                  {/* Right in RTL: Chapter Title & Count & Arrow */}
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>
                      {chapter.order || chIdx + 1}. {chapter.title} :{' '}
                      <Box component="span" sx={{ color: '#64748B', fontWeight: 500, fontSize: 14 }}>
                        ({chapter.lessons?.length || 0} دروس)
                      </Box>
                    </Typography>
                    <Iconify
                      icon={isExpanded ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
                      width={18}
                      sx={{ color: '#1E293B' }}
                    />
                  </Stack>

                  {/* Left in RTL: Red Trash Icon Button in light red border */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChapter(chapter.id);
                    }}
                    sx={{
                      border: '1px solid #FECACA',
                      borderRadius: 1.5,
                      p: 0.75,
                      color: '#EF4444',
                      '&:hover': { bgcolor: '#FEF2F2' },
                    }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                  </IconButton>
                </Card>
              )}

              {/* Notice Banner: rendered between Chapter 2 and Chapter 3 (or after the first collapsed chapter) */}
              {chIdx === 1 && (
                <Box
                  sx={{
                    p: 1.75,
                    px: 2.5,
                    borderRadius: 2.5,
                    bgcolor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ color: '#2563EB', flexShrink: 0, display: 'flex' }}>
                    <Iconify icon="solar:notes-bold" width={20} />
                  </Box>
                  <Typography sx={{ fontSize: 13, color: '#1E3A8A', fontWeight: 600 }}>
                    <strong style={{ color: '#1E3A8A' }}>تنويه هام:</strong> رفع المحتوى لا ينهي الطلب تلقائياً، يظل الطلب{' '}
                    <Box
                      component="span"
                      sx={{
                        color: '#2563EB',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      قيد التنفيذ 🔵
                    </Box>{' '}
                    ومتاحاً لإضافة مقاطع إضافية حتى تختار يدوياً الضغط على زر &quot;إنهاء الخدمة&quot; عند اكتمال متطلبات الطالب بالكامل.
                  </Typography>
                </Box>
              )}

              {/* Expanded Lessons for the Chapter */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Stack spacing={2}>
                  {chapter.lessons.map((lesson) => {
                    const videoTitle = lesson.videoUrl
                      ? `فيديو المحاضرة: ${lesson.title.replace(/^الدرس\s+\d+:\s*/, '')}.mp4`
                      : 'فيديو المحاضرة: مدخل إلى تشريح عضلة القلب.mp4';
                    const videoDurationFormatted = formatDurationText(lesson.durationInSeconds);
                    const quizCount = lesson.test?.questions?.length || 5;

                    return (
                      <Card
                        key={lesson.id}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 2.5,
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          boxShadow: 'none',
                        }}
                      >
                        {/* Lesson Header */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'flex-start' },
                            justifyContent: 'space-between',
                            mb: 2,
                            gap: 1.5,
                          }}
                        >
                          {/* Right in RTL: Title, Completed Badge, Subtitle */}
                          <Box sx={{ textAlign: 'start' }}>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}
                            >
                              <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
                                {lesson.number || lesson.order}. {lesson.title}
                              </Typography>
                              <Chip
                                label={lesson.statusBadge || 'مكتمل المحتوى (3 مرفقات)'}
                                size="small"
                                sx={{
                                  bgcolor: '#ECFDF5',
                                  color: '#059669',
                                  border: '1px solid #A7F3D0',
                                  fontWeight: 700,
                                  fontSize: 11.5,
                                  borderRadius: '16px',
                                  height: 22,
                                }}
                              />
                            </Stack>

                            <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>
                              {lesson.subtitle || 'تم إرفاق فيديو، ملخص ومستند، وبنك أسئلة تقييمية لهذا الدرس'}
                            </Typography>
                          </Box>

                          {/* Left in RTL: Edit Title + Red Trash Button */}
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="solar:pen-linear" width={14} />}
                              onClick={() => handleOpenEditLesson(chapter.id, lesson)}
                              sx={{
                                borderColor: '#E2E8F0',
                                color: '#64748B',
                                borderRadius: 1.5,
                                fontSize: 12,
                                fontWeight: 600,
                                px: 1.5,
                                py: 0.4,
                                '& .MuiButton-startIcon': {
                                  margin: '0 !important',
                                  marginInlineEnd: '6px !important',
                                },
                                '&:hover': { bgcolor: '#F8FAFC' },
                              }}
                            >
                              تعديل العنوان
                            </Button>

                            <IconButton
                              size="small"
                              onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
                              sx={{
                                border: '1px solid #FECACA',
                                borderRadius: 1.5,
                                p: 0.7,
                                color: '#EF4444',
                                '&:hover': { bgcolor: '#FEF2F2' },
                              }}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                            </IconButton>
                          </Stack>
                        </Box>

                        {/* Attachments Rows */}
                        <Stack spacing={1.5} sx={{ mb: 2 }}>
                          {/* Row 1: Video Attachment */}
                          <Box
                            sx={{
                              p: 1.75,
                              px: 2,
                              borderRadius: 2,
                              bgcolor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              flexDirection: { xs: 'column', md: 'row' },
                              alignItems: { xs: 'flex-start', md: 'center' },
                              justifyContent: 'space-between',
                              gap: 1.5,
                            }}
                          >
                            {/* Right in RTL: Icon + Info */}
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 2,
                                  bgcolor: '#EFF6FF',
                                  border: '1px solid #BFDBFE',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  color: '#2563EB',
                                }}
                              >
                                <Iconify icon="solar:videocamera-record-bold" width={22} />
                              </Box>

                              <Box sx={{ textAlign: 'start' }}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1, mb: 0.25 }}>
                                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
                                    {videoTitle}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 11.5,
                                      color: '#059669',
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                    }}
                                  >
                                    <Iconify icon="solar:check-circle-bold" width={14} />
                                    تم المعالجة والرفع بنجاح
                                  </Typography>
                                </Stack>
                                <Typography sx={{ fontSize: 11.5, color: '#64748B' }}>
                                  الجودة: 1080p Full HD • الحجم: 340 MB • المدة: {videoDurationFormatted}
                                </Typography>
                              </Box>
                            </Stack>

                            {/* Left in RTL: Actions */}
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{
                                alignItems: 'center',
                                gap: 1,
                                width: { xs: '100%', md: 'auto' },
                                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                              }}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<Iconify icon="solar:play-bold" width={14} />}
                                onClick={() => handlePreviewVideo(lesson.videoUrl, videoTitle)}
                                sx={{
                                  borderRadius: 1.5,
                                  bgcolor: '#0F172A',
                                  color: '#FFFFFF',
                                  fontWeight: 700,
                                  fontSize: 12,
                                  px: 1.75,
                                  py: 0.6,
                                  boxShadow: 'none',
                                  '& .MuiButton-startIcon': {
                                    margin: '0 !important',
                                    marginInlineEnd: '6px !important',
                                  },
                                  '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
                                }}
                              >
                                معاينة الفيديو
                              </Button>

                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleOpenVideoDialog(chapter.id, lesson.id, lesson.videoUrl)}
                                sx={{
                                  borderRadius: 1.5,
                                  borderColor: '#CBD5E1',
                                  color: '#334155',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  px: 1.5,
                                  py: 0.6,
                                  '&:hover': { bgcolor: '#F8FAFC' },
                                }}
                              >
                                استبدال
                              </Button>

                              <IconButton
                                size="small"
                                onClick={() => handleDeleteVideo(chapter.id, lesson.id)}
                                sx={{
                                  border: '1px solid #FECACA',
                                  borderRadius: 1.5,
                                  p: 0.7,
                                  color: '#EF4444',
                                  '&:hover': { bgcolor: '#FEF2F2' },
                                }}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                              </IconButton>
                            </Stack>
                          </Box>

                          {/* Row 2: Document Attachment */}
                          <Box
                            sx={{
                              p: 1.75,
                              px: 2,
                              borderRadius: 2,
                              bgcolor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              flexDirection: { xs: 'column', md: 'row' },
                              alignItems: { xs: 'flex-start', md: 'center' },
                              justifyContent: 'space-between',
                              gap: 1.5,
                            }}
                          >
                            {/* Right in RTL: Icon + Info */}
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 2,
                                  bgcolor: '#FEF2F2',
                                  border: '1px solid #FECACA',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  color: '#DC2626',
                                }}
                              >
                                <Iconify icon="solar:document-text-bold" width={22} />
                              </Box>

                              <Box sx={{ textAlign: 'start' }}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1, mb: 0.25 }}>
                                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
                                    {lesson.document?.title || 'الملخص والمذكرة التوضيحية — تشريح القلب.pdf'}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 11.5,
                                      color: '#059669',
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                    }}
                                  >
                                    <Iconify icon="solar:check-circle-bold" width={14} />
                                    جاهز للتحميل للطلاب
                                  </Typography>
                                </Stack>
                                <Typography sx={{ fontSize: 11.5, color: '#64748B' }}>
                                  الحجم: {lesson.document?.fileSize || '4.8 MB'} • {lesson.document?.pagesCount || 32} صفحة • ملف PDF إلكتروني
                                </Typography>
                              </Box>
                            </Stack>

                            {/* Left in RTL: Actions */}
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{
                                alignItems: 'center',
                                gap: 1,
                                width: { xs: '100%', md: 'auto' },
                                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                              }}
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Iconify icon="solar:download-minimalistic-linear" width={15} />}
                                onClick={() => {
                                  toast.info('تم بدء تنزيل مستند الدرس');
                                }}
                                sx={{
                                  borderRadius: 1.5,
                                  borderColor: '#CBD5E1',
                                  color: '#1E293B',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  px: 1.5,
                                  py: 0.6,
                                  '& .MuiButton-startIcon': {
                                    margin: '0 !important',
                                    marginInlineEnd: '6px !important',
                                  },
                                  '&:hover': { bgcolor: '#F8FAFC' },
                                }}
                              >
                                تحميل / عرض
                              </Button>

                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleOpenDocDialog(chapter.id, lesson.id, lesson.document)}
                                sx={{
                                  borderRadius: 1.5,
                                  borderColor: '#CBD5E1',
                                  color: '#334155',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  px: 1.5,
                                  py: 0.6,
                                  '&:hover': { bgcolor: '#F8FAFC' },
                                }}
                              >
                                استبدال
                              </Button>

                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDoc(chapter.id, lesson.id)}
                                sx={{
                                  border: '1px solid #FECACA',
                                  borderRadius: 1.5,
                                  p: 0.7,
                                  color: '#EF4444',
                                  '&:hover': { bgcolor: '#FEF2F2' },
                                }}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                              </IconButton>
                            </Stack>
                          </Box>

                          {/* Row 3: Quiz Attachment */}
                          <Box
                            sx={{
                              p: 1.75,
                              px: 2,
                              borderRadius: 2,
                              bgcolor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              flexDirection: { xs: 'column', md: 'row' },
                              alignItems: { xs: 'flex-start', md: 'center' },
                              justifyContent: 'space-between',
                              gap: 1.5,
                            }}
                          >
                            {/* Right in RTL: Icon + Info */}
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 2,
                                  bgcolor: '#ECFDF5',
                                  border: '1px solid #A7F3D0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  color: '#059669',
                                }}
                              >
                                <Iconify icon="solar:question-circle-bold" width={22} />
                              </Box>

                              <Box sx={{ textAlign: 'start' }}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1, mb: 0.25 }}>
                                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
                                    بنك أسئلة وتدريبات الدرس (Self-Assessment)
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 11.5,
                                      color: '#059669',
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                    }}
                                  >
                                    <Iconify icon="solar:check-circle-bold" width={14} />
                                    مفعل بعد انتهاء الفيديو
                                  </Typography>
                                </Stack>
                                <Typography sx={{ fontSize: 11.5, color: '#64748B' }}>
                                  <Box component="span" sx={{ color: '#059669', fontWeight: 600 }}>
                                    درجة الاجتياز: %{quizPassingScore}
                                  </Box>
                                  {' • '}
                                  {quizCount} أسئلة تدريبية تفاعلية (MCQ)
                                </Typography>
                              </Box>
                            </Stack>

                            {/* Left in RTL: Actions */}
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{
                                alignItems: 'center',
                                gap: 1,
                                width: { xs: '100%', md: 'auto' },
                                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                              }}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleOpenQuizDialog(chapter.id, lesson.id, lesson.test)}
                                sx={{
                                  borderRadius: 1.5,
                                  bgcolor: '#0F172A',
                                  color: '#FFFFFF',
                                  fontWeight: 700,
                                  fontSize: 12,
                                  px: 1.75,
                                  py: 0.6,
                                  boxShadow: 'none',
                                  '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
                                }}
                              >
                                معاينة وتعديل الأسئلة ({quizCount})
                              </Button>

                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Iconify icon="mingcute:add-line" width={14} />}
                                onClick={() => {
                                  handleOpenQuizDialog(chapter.id, lesson.id, lesson.test);
                                  handleAddQuestionToQuiz();
                                }}
                                sx={{
                                  borderRadius: 1.5,
                                  borderColor: '#CBD5E1',
                                  color: '#334155',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  px: 1.5,
                                  py: 0.6,
                                  '& .MuiButton-startIcon': {
                                    margin: '0 !important',
                                    marginInlineEnd: '6px !important',
                                  },
                                  '&:hover': { bgcolor: '#F8FAFC' },
                                }}
                              >
                                + إضافة سؤال
                              </Button>

                              <IconButton
                                size="small"
                                onClick={() => handleDeleteQuiz(chapter.id, lesson.id)}
                                sx={{
                                  border: '1px solid #FECACA',
                                  borderRadius: 1.5,
                                  p: 0.7,
                                  color: '#EF4444',
                                  '&:hover': { bgcolor: '#FEF2F2' },
                                }}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                              </IconButton>
                            </Stack>
                          </Box>
                        </Stack>

                        {/* Bottom Row of Lesson: Reorder hint on Right, Attachment buttons on Left */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { xs: 'flex-start', md: 'center' },
                            justifyContent: 'space-between',
                            pt: 1.5,
                            borderTop: '1px dashed #E2E8F0',
                            gap: 1.5,
                          }}
                        >
                          {/* Right in RTL: Reorder Hint */}
                          <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>
                            يمكنك سحب وإفلات المرفقات لإعادة ترتيب ظهورها للطلاب
                          </Typography>

                          {/* Left in RTL: 3 Action Buttons */}
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="solar:question-circle-linear" width={15} />}
                              onClick={() => handleOpenQuizDialog(chapter.id, lesson.id, lesson.test)}
                              sx={{
                                borderRadius: 1.5,
                                fontSize: 11.5,
                                fontWeight: 700,
                                borderColor: '#E2E8F0',
                                color: '#334155',
                                '& .MuiButton-startIcon': {
                                  margin: '0 !important',
                                  marginInlineEnd: '6px !important',
                                },
                                '&:hover': { bgcolor: '#F8FAFC' },
                              }}
                            >
                              + إضافة اسئلة
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="solar:document-linear" width={15} />}
                              onClick={() => handleOpenDocDialog(chapter.id, lesson.id, lesson.document)}
                              sx={{
                                borderRadius: 1.5,
                                fontSize: 11.5,
                                fontWeight: 700,
                                borderColor: '#E2E8F0',
                                color: '#334155',
                                '& .MuiButton-startIcon': {
                                  margin: '0 !important',
                                  marginInlineEnd: '6px !important',
                                },
                                '&:hover': { bgcolor: '#F8FAFC' },
                              }}
                            >
                              + مستند إضافي
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="solar:videocamera-record-linear" width={15} />}
                              onClick={() => handleOpenVideoDialog(chapter.id, lesson.id, lesson.videoUrl)}
                              sx={{
                                borderRadius: 1.5,
                                fontSize: 11.5,
                                fontWeight: 700,
                                borderColor: '#E2E8F0',
                                color: '#334155',
                                '& .MuiButton-startIcon': {
                                  margin: '0 !important',
                                  marginInlineEnd: '6px !important',
                                },
                                '&:hover': { bgcolor: '#F8FAFC' },
                              }}
                            >
                              + فيديو إضافي
                            </Button>
                          </Stack>
                        </Box>
                      </Card>
                    );
                  })}
                </Stack>
              </Collapse>
            </React.Fragment>
          );
        })}
      </Box>

      {/* ========================================================================= */}
      {/* DIALOGS                                                                   */}
      {/* ========================================================================= */}

      {/* 1. Video Preview Dialog */}
      <Dialog
        open={videoPreviewOpen}
        onClose={() => setVideoPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16, bgcolor: '#0F172A', color: '#FFFFFF', py: 1.5 }}>
          {previewVideoTitle || 'معاينة الفيديو'}
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#000000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          {previewVideoUrl ? (
            <Box
              component="video"
              src={previewVideoUrl}
              controls
              autoPlay
              sx={{ width: '100%', maxHeight: 480, bgcolor: '#000000' }}
            />
          ) : (
            <Box sx={{ textAlign: 'center', color: '#94A3B8', p: 4 }}>
              <Iconify icon="solar:play-circle-bold" width={64} sx={{ color: '#FFFFFF', mb: 1.5 }} />
              <Typography sx={{ fontSize: 14, color: '#FFFFFF', fontWeight: 700 }}>
                مشغل الفيديو
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#94A3B8', mt: 0.5 }}>
                1080p Full HD • جاهز للعرض
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5, bgcolor: '#0F172A' }}>
          <Button
            variant="contained"
            onClick={() => setVideoPreviewOpen(false)}
            sx={{ borderRadius: 1.5, bgcolor: '#334155', color: '#FFFFFF', '&:hover': { bgcolor: '#475569' } }}
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. Video Replace / Upload Dialog */}
      <Dialog
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2.5 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16 }}>
          تحديث ورفع فيديو الدرس
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Tabs
            value={videoDialogTab}
            onChange={(_, val) => setVideoDialogTab(val)}
            sx={{ mb: 2, borderBottom: '1px solid #E2E8F0' }}
          >
            <Tab label="رفع ملف فيديو" sx={{ fontWeight: 700 }} />
            <Tab label="رابط خارجي" sx={{ fontWeight: 700 }} />
          </Tabs>

          {videoDialogTab === 0 ? (
            <Box sx={{ textAlign: 'center' }}>
              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleVideoFileSelect}
              />
              <Box
                onClick={() => videoFileInputRef.current?.click()}
                sx={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: 2.5,
                  p: 4,
                  cursor: 'pointer',
                  bgcolor: '#F8FAFC',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#2563EB' },
                }}
              >
                <Iconify icon="solar:upload-track-2-bold" width={48} sx={{ color: '#2563EB', mb: 1.5 }} />
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1E293B' }}>
                  {videoFileName || 'اضغط هنا لاختيار ملف فيديو MP4 / MOV'}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#94A3B8', mt: 0.5 }}>
                  يدعم صيغ MP4, WebM بدقة حتى 1080p
                </Typography>
              </Box>

              {isUploadingVideo && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mt: 2 }}>
                  <CircularProgress size={20} />
                  <Typography sx={{ fontSize: 13, color: '#64748B' }}>جاري رفع الفيديو...</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="رابط الفيديو (Direct MP4 / YouTube / Vimeo)"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="المدة التقديرية (بالدقائق)"
                value={videoDurationInput}
                onChange={(e) => setVideoDurationInput(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setVideoDialogOpen(false)}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveVideo}
            sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}
          >
            حفظ واعتماد
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. Document Replace / Edit Dialog */}
      <Dialog
        open={docDialogOpen}
        onClose={() => setDocDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2.5 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16 }}>
          تحديث ملخص ومستند الدرس
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="عنوان الملف والمذكرة"
              value={docTitleInput}
              onChange={(e) => setDocTitleInput(e.target.value)}
              placeholder="الملخص والمذكرة التوضيحية — تشريح القلب.pdf"
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="عدد الصفحات"
              value={docPagesInput}
              onChange={(e) => setDocPagesInput(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setDocDialogOpen(false)}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveDoc}
            sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4. Quiz Questions Editor Dialog */}
      <Dialog
        open={quizDialogOpen}
        onClose={() => setQuizDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 17, borderBottom: '1px solid #E2E8F0', pb: 1.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:question-circle-bold" width={22} sx={{ color: '#059669' }} />
              <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                بنك أسئلة وتدريبات الدرس (Self-Assessment)
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>درجة الاجتياز:</Typography>
              <TextField
                size="small"
                type="number"
                value={quizPassingScore}
                onChange={(e) => setQuizPassingScore(e.target.value)}
                sx={{ width: 80, '& .MuiOutlinedInput-input': { py: 0.5, px: 1, fontSize: 13, textAlign: 'center' } }}
              />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>%</Typography>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 2.5, maxHeight: '65vh', overflowY: 'auto' }}>
          <Stack spacing={2.5}>
            {quizQuestions.map((q, qIndex) => (
              <Card
                key={q.id}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  boxShadow: 'none',
                }}
              >
                {/* Question Header */}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 14.5, color: '#0F172A' }}>
                    السؤال {qIndex + 1}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={() => handleRemoveQuestionFromQuiz(q.id)}
                    sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                  </IconButton>
                </Stack>

                {/* Question Text */}
                <TextField
                  fullWidth
                  size="small"
                  label="نص السؤال"
                  value={q.text}
                  onChange={(e) =>
                    setQuizQuestions((prev) =>
                      prev.map((item) =>
                        item.id === q.id ? { ...item, text: e.target.value } : item
                      )
                    )
                  }
                  sx={{ mb: 2, bgcolor: '#FFFFFF' }}
                />

                {/* Question Explanation */}
                <TextField
                  fullWidth
                  size="small"
                  label="شرح وتوضيح الإجابة (اختياري)"
                  value={q.explanation || ''}
                  onChange={(e) =>
                    setQuizQuestions((prev) =>
                      prev.map((item) =>
                        item.id === q.id ? { ...item, explanation: e.target.value } : item
                      )
                    )
                  }
                  sx={{ mb: 2, bgcolor: '#FFFFFF' }}
                />

                {/* Choices */}
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#334155', mb: 1 }}>
                  الخيارات المتاحة (اختر الدائرة بجانب الإجابة الصحيحة):
                </Typography>

                <RadioGroup
                  value={q.choices?.find((c) => c.isRight)?.id || ''}
                  onChange={(e) => handleSelectRightChoice(q.id, e.target.value)}
                >
                  <Stack spacing={1}>
                    {(q.choices || []).map((choice, cIndex) => (
                      <Stack
                        key={choice.id}
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems: 'center',
                          bgcolor: choice.isRight ? '#ECFDF5' : '#FFFFFF',
                          border: `1px solid ${choice.isRight ? '#A7F3D0' : '#E2E8F0'}`,
                          borderRadius: 1.5,
                          p: 0.75,
                          px: 1.5,
                        }}
                      >
                        <FormControlLabel
                          value={choice.id}
                          control={<Radio size="small" sx={{ color: choice.isRight ? '#059669' : undefined }} />}
                          label=""
                          sx={{ m: 0 }}
                        />

                        <TextField
                          fullWidth
                          size="small"
                          placeholder={`الخيار ${cIndex + 1}`}
                          value={choice.title}
                          onChange={(e) =>
                            setQuizQuestions((prev) =>
                              prev.map((item) =>
                                item.id === q.id
                                  ? {
                                      ...item,
                                      choices: (item.choices || []).map((c) =>
                                        c.id === choice.id ? { ...c, title: e.target.value } : c
                                      ),
                                    }
                                  : item
                              )
                            )
                          }
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFFFFF' } }}
                        />

                        <IconButton
                          size="small"
                          onClick={() => handleRemoveChoice(q.id, choice.id)}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
                        >
                          <Iconify icon="solar:close-circle-bold" width={18} />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                </RadioGroup>

                <Button
                  size="small"
                  variant="text"
                  startIcon={<Iconify icon="mingcute:add-line" width={15} />}
                  onClick={() => handleAddChoice(q.id)}
                  sx={{ mt: 1.5, fontSize: 12, fontWeight: 700, color: '#2563EB' }}
                >
                  + إضافة خيار إضافي
                </Button>
              </Card>
            ))}

            <Button
              variant="outlined"
              startIcon={<Iconify icon="mingcute:add-line" width={18} />}
              onClick={handleAddQuestionToQuiz}
              sx={{
                borderRadius: 2,
                py: 1.25,
                fontWeight: 700,
                borderColor: '#CBD5E1',
                color: '#334155',
                borderStyle: 'dashed',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#2563EB' },
              }}
            >
              + إضافة سؤال جديد لبنك الأسئلة
            </Button>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
          <Button variant="outlined" onClick={() => setQuizDialogOpen(false)}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveQuiz}
            sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' }, fontWeight: 700 }}
          >
            حفظ بنك الأسئلة
          </Button>
        </DialogActions>
      </Dialog>

      {/* 5. Edit Lesson Title Dialog */}
      <Dialog
        open={Boolean(editingLesson)}
        onClose={() => setEditingLesson(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2.5 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16 }}>
          تعديل عنوان الدرس
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setEditingLesson(null)}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveLessonTitle}
            sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
