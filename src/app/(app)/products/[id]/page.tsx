import ProductDetailsPage from "./_components/client-page";

export default async function Page({
  params: paramsProp,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await paramsProp;

  return (
    <>
      <ProductDetailsPage params={params} />
    </>
  );
}
