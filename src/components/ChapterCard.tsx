"use client";

import Link from 'next/link';

interface ChapterCardProps {
  id: number;
  chapter: string;
  description: string;
}

export default function ChapterCard({ id, chapter, description }: ChapterCardProps) {
  return (
    <Link href={`/chapter/${id}`}>
      <div className="p-6 border rounded-2xl shadow-md hover:shadow-xl transition duration-300 cursor-pointer">
        <h2 className="text-xl font-bold mb-2">{chapter}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
