import ContentEditorView from 'src/sections/content-pages/content-editor-view';
import { MOCK_TERMS_CONTENT } from 'src/sections/content-pages/_mock';

export default function TermsPage() {
  return (
    <ContentEditorView
      translationNamespace="TermsAndConditions"
      initialData={MOCK_TERMS_CONTENT}
    />
  );
}
