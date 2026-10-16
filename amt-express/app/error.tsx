'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {t('error.title', 'Something went wrong')}
        </h2>
        <p className="text-gray-700 mb-4">
          {t('error.description', 'An unexpected error occurred.')}
        </p>
        <p className="text-sm text-gray-500 mb-6 break-all">
          {error.message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('error.tryAgain', 'Try again')}
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            {t('error.goHome', 'Go home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
