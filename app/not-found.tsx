import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <Image src="/img/mark.png" alt="" width={110} height={110} style={{ margin: '0 auto 16px' }} />
        <h1 className="h2">This path isn&apos;t on our map.</h1>
        <p>The page you are looking for has moved or never existed.</p>
        <Link href="/" className="btn btn--primary"><span>Back to home</span><i className="btn__arrow">→</i></Link>
      </div>
    </main>
  );
}
