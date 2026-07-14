import { PaymentSuccessView } from '@/components/payments/PaymentSuccessView';

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token || '';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0B0F19] bg-[url('/grid-pattern.svg')] bg-repeat flex items-center justify-center">
      <PaymentSuccessView token={token} />
    </div>
  );
}
