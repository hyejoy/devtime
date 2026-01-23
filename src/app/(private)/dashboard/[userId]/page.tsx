import { UrlWithStringQuery } from 'url';

export default async function Page({
  params,
}: {
  params: { userId: UrlWithStringQuery };
}) {
  console.log(params);

  const { userId } = await params;
  return (
    <>
      <h1>{`Other User Dashboard Component ${userId}`}</h1>
    </>
  );
}
