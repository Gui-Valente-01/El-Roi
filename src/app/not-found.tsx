import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1C2E4A] p-4 text-white">
      <div className="max-w-md space-y-8 text-center">
        <div>
          <h1 className="mb-4 font-monigue text-6xl tracking-widest text-[#D9D7CF] md:text-8xl">
            404
          </h1>
          <p className="mb-2 text-lg text-gray-300">Pagina nao encontrada</p>
          <p className="text-sm text-gray-400">
            A pagina que voce esta procurando nao existe ou foi removida.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block rounded bg-[#D9D7CF] px-8 py-3 font-bold text-[#1C2E4A] transition-colors hover:bg-white"
        >
          Voltar ao Inicio
        </Link>
      </div>
    </div>
  );
}
