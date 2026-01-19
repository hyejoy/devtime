import Link from 'next/link';

export default function Page() {
  return (
    <>
      <h1>Main Page</h1>
      <Link href={'/signup'}>회원가입</Link>
    </>
  );
}
