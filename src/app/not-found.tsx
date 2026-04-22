import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1C2E4A] text-white flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        <div>
          <h1 className="font-monigue text-6xl md:text-8xl tracking-widest text-[#D9D7CF] mb-4">
            404
          </h1>
          <p className="text-lg text-gray-300 mb-2">Página não encontrada</p>
          <p className="text-sm text-gray-400">
            A página que você está procurando não existe ou foi removida.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#D9D7CF] text-[#1C2E4A] font-bold hover:bg-white transition-colors rounded"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
