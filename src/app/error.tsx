'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#1C2E4A] text-white flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        <div>
          <h1 className="font-monigue text-6xl md:text-8xl tracking-widest text-[#D9D7CF] mb-4">
            Oops!
          </h1>
          <p className="text-lg text-gray-300 mb-2">Algo deu errado</p>
          <p className="text-sm text-gray-400 mb-4">{error.message}</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-[#D9D7CF] text-[#1C2E4A] font-bold hover:bg-white transition-colors rounded"
          >
            Tentar Novamente
          </button>
          <Link
            href="/"
            className="px-8 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors rounded"
          >
            Voltar ao Início
          </Link>
        </div>

        <p className="text-xs text-gray-500">Erro ID: {error.digest}</p>
      </div>
    </div>
  );
}
