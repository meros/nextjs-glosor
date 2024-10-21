import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>Home Page</h1>
      <ul>
        <li>
          <Link href="/edit">Go to Edit Page</Link>
        </li>
        <li>
          <Link href="/train">Go to Train Page</Link>
        </li>
      </ul>
    </div>
  );
}
