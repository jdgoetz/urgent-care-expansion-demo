import PocketDetailClient from "@/components/market/PocketDetailClient";

export default async function PocketPage({ params }: { params: Promise<{ pocketId: string }> }) {
  const { pocketId } = await params;
  return <PocketDetailClient pocketId={pocketId} />;
}

