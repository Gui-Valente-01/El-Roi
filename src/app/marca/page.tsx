import Image from 'next/image';
import Link from 'next/link';

export default function Marca() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-800">
      <header className="absolute top-0 z-40 w-full bg-transparent">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-monigue text-4xl tracking-widest text-[#D9D7CF] drop-shadow-lg transition-transform hover:scale-105"
          >
            El Roi
          </Link>
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-wider text-white drop-shadow-md transition-colors hover:text-[#D9D7CF]"
          >
            Voltar para a Loja
          </Link>
        </div>
      </header>

      <section
        className="relative flex h-[70vh] w-full items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-[#1C2E4A]/70" />

        <div className="relative z-10 mx-auto mt-10 max-w-4xl px-4 text-center">
          <h1 className="mb-4 font-monigue text-6xl tracking-widest text-[#D9D7CF] drop-shadow-2xl md:text-8xl lg:text-9xl">
            A Marca
          </h1>
          <p className="font-collsmith text-3xl text-white drop-shadow-md md:text-5xl">
            Muito alem do tecido.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div className="space-y-8">
            <h2 className="font-monigue text-5xl tracking-wider text-[#1C2E4A] md:text-7xl">
              O Deus que me ve
            </h2>
            <div className="h-1 w-20 bg-[#1C2E4A]" />

            <p className="text-lg font-light leading-relaxed text-gray-600 md:text-xl">
              A <strong className="font-bold text-[#1C2E4A]">El Roi</strong> nasceu no asfalto,
              mas com os olhos voltados para o alto. O nosso nome vem do hebraico e significa{' '}
              <em>&ldquo;O Deus que me ve&rdquo;</em>.
            </p>
            <p className="text-lg font-light leading-relaxed text-gray-600 md:text-xl">
              Acreditamos que a moda e uma linguagem silenciosa, mas extremamente poderosa. Por
              isso, criamos pecas de streetwear que carregam mais do que estilo: elas carregam
              identidade, proposito e uma mensagem de fe em cada costura.
            </p>
            <p className="text-lg font-light leading-relaxed text-gray-600 md:text-xl">
              Nos nao vendemos apenas camisetas. Nos vestimos atitude. Nos vestimos quem sabe que,
              mesmo no meio da multidao da cidade, nunca esta invisivel.
            </p>
          </div>

          <div className="relative h-[500px] overflow-hidden rounded-3xl shadow-2xl md:h-[600px]">
            <Image
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop"
              alt="Estilo Streetwear El Roi"
              fill
              className="absolute inset-0 h-full w-full object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <div className="pointer-events-none absolute inset-0 m-4 rounded-2xl border-8 border-white/10" />
          </div>
        </div>
      </section>

      <section className="bg-[#1C2E4A] py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-monigue text-5xl tracking-wider text-[#D9D7CF] md:text-7xl">
              Nossa Essencia
            </h2>
            <p className="font-collsmith text-3xl text-gray-400">
              Os tres pilares da nossa caminhada
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 transition-colors hover:bg-white/10">
              <h3 className="mb-4 font-monigue text-4xl tracking-widest text-[#D9D7CF]">
                Proposito
              </h3>
              <p className="leading-relaxed text-gray-300">
                Cada colecao tem uma historia. Cada estampa tem uma base biblica. Voce nao esta
                apenas se vestindo, esta declarando aquilo em que acredita.
              </p>
            </div>

            <div className="mt-0 rounded-3xl border border-white/10 bg-white/5 p-10 transition-colors hover:bg-white/10 md:mt-8">
              <h3 className="mb-4 font-monigue text-4xl tracking-widest text-[#D9D7CF]">
                Qualidade
              </h3>
              <p className="leading-relaxed text-gray-300">
                Do fio de algodao ao acabamento da gola. Entregamos o melhor porque servimos ao
                melhor. Camisetas premium feitas para durar.
              </p>
            </div>

            <div className="mt-0 rounded-3xl border border-white/10 bg-white/5 p-10 transition-colors hover:bg-white/10 md:mt-16">
              <h3 className="mb-4 font-monigue text-4xl tracking-widest text-[#D9D7CF]">
                Atitude
              </h3>
              <p className="leading-relaxed text-gray-300">
                O cristao nao precisa ser careta. Trazemos a estetica urbana das ruas, cortes
                modernos, oversized e modelagens exclusivas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-[6px] border-[#D9D7CF] bg-black py-20 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <p className="mb-10 font-collsmith text-4xl leading-snug text-[#D9D7CF] md:text-6xl">
            &ldquo;Para que todos vejam, saibam, considerem e compreendam juntos que a mao do Senhor
            fez isso.&rdquo;
          </p>
          <Link
            href="/"
            className="inline-block rounded-full border-2 border-[#1C2E4A] bg-[#1C2E4A] px-10 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:border-white hover:bg-transparent hover:text-white"
          >
            Conheca as Colecoes
          </Link>
        </div>
      </section>
    </div>
  );
}
