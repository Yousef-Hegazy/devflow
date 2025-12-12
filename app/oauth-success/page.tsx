import Loading from "@/components/Loading";
import HandleOAuthSuccess from "./HandleOAuthSuccess";

export default async function OAuthSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ userId: string; secret: string; provider: string }>;
}) {
  const { userId, secret, provider } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading />
      <HandleOAuthSuccess userId={userId} secret={secret} provider={provider} />
    </div>
  );
}
