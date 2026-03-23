import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="text-6xl font-bold font-mono mb-4 neon-text">404</h1>
      <h2 className="text-2xl font-semibold font-mono mb-4 text-gray-300">Page Not Found</h2>
      <p className="text-gray-500 mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="neon-btn font-mono">
        Go Home
      </Link>
    </div>
  );
}
