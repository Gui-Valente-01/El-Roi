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
    <div className="flex min-h-screen items-center justify-center bg-[#1C2E4A] p-4 text-white">
      <div className="max-w-md space-y-8 text-center">
        <div>
          <h1 className="mb-4 font-monigue text-6xl tracking-widest text-[#D9D7CF] md:text-8xl">
            Oops!
          </h1>
          <p className="mb-2 text-lg text-gray-300">Algo deu errado</p>
          <p className="mb-4 text-sm text-gray-400">
            Nao conseguimos concluir essa acao agora. Tente novamente em instantes.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="rounded bg-[#D9D7CF] px-8 py-3 font-bold text-[#1C2E4A] transition-colors hover:bg-white"
          >
            Tentar Novamente
          </button>
          <Link
            href="/"
            className="rounded bg-gray-700 px-8 py-3 font-bold text-white transition-colors hover:bg-gray-600"
          >
            Voltar ao Inicio
          </Link>
        </div>

        <p className="text-xs text-gray-500">Erro ID: {error.digest}</p>
      </div>
    </div>
  );
}
