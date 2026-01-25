import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>hello from the index page</h1>
      <Link href="/about">About page</Link>
    </div>
  );
}
