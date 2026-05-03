import { ResetPasswordView } from "@/src/features/auth/views/ResetPasswordView";

export default function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ email: string }>;
}) {
  return (
    <ResetPasswordWrapper params={params} searchParams={searchParams} />
  );
}

async function ResetPasswordWrapper({
    params,
    searchParams,
  }: {
    params: Promise<{ token: string }>;
    searchParams: Promise<{ email: string }>;
  }) {
    const { token } = await params;
    const { email } = await searchParams;
    
    return <ResetPasswordView token={token} email={email} />;
  }
