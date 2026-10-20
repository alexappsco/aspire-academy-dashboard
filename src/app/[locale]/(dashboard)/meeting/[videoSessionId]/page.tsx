import App from 'src/sections/video_sdk/app';

type Props = {
  params: Promise<{
    videoSessionId: string;
    locale: string;
  }>;
};

export default async function page({ params }: Props) {
  const { videoSessionId } = await params;
  console.log(
    '[Page Init] Meeting page loaded with videoSessionIdaaaaaaaaaaaaaaaaaa:',
    videoSessionId
  );
  return <App videoSessionId={videoSessionId} />;
}
