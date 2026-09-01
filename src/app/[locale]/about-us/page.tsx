import ContentEditorView from 'src/sections/content-pages/content-editor-view';
import { MOCK_ABOUT_CONTENT } from 'src/sections/content-pages/_mock';

export default function AboutUsPage() {
  return (
    <ContentEditorView
      translationNamespace="AboutUs"
      initialData={MOCK_ABOUT_CONTENT}
    />
  );
}
