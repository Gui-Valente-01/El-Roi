import Link from 'next/link';

export default function Marca() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen text-gray-800 font-sans">
      
      {/* HEADER SIMPLIFICADO (Para o cliente conseguir voltar) */}
      <header className="absolute top-0 w-full z-40 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-24">
          <Link href="/" className="font-monigue text-4xl tracking-widest text-[#D9D7CF] drop-shadow-lg hover:scale-105 transition-transform">
            El Roi
          </Link>
          <Link href="/" className="text-white font-bold uppercase tracking-wider text-sm hover:text-[#D9D7CF] transition-colors drop-shadow-md">
            Voltar para a Loja
          </Link>
        </div>
      </header>

      {/* HERO SECTION - BANNER DA MARCA (Fundo de Deserto/Montanha dramático) */}
      <section 
        className="relative h-[70vh] w-full bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')" }}
      >
        {/* Camada escura */}
        <div className="absolute inset-0 bg-[#1C2E4A]/70"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <h1 className="font-monigue text-6xl md:text-8xl lg:text-9xl text-[#D9D7CF] tracking-widest drop-shadow-2xl mb-4">
            A Marca
          </h1>
          <p className="font-collsmith text-3xl md:text-5xl text-white drop-shadow-md">
            Muito além do tecido.
          </p>
        </div>
      </section>

      {/* SEÇÃO DA HISTÓRIA (Texto + Imagem Urbana) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* Lado do Texto */}
          <div className="space-y-8">
            <h2 className="font-monigue text-5xl md:text-7xl text-[#1C2E4A] tracking-wider">
              O Deus que me vê
            </h2>
            <div className="w-20 h-1 bg-[#1C2E4A]"></div>
            
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light">
              A <strong className="text-[#1C2E4A] font-bold">El Roi</strong> nasceu no asfalto, mas com os olhos voltados para o alto. O nosso nome vem do hebraico e significa <em>"O Deus que me vê"</em>. 
            </p>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light">
              Acreditamos que a moda é uma linguagem silenciosa, mas extremamente poderosa. Por isso, criamos peças de streetwear que carregam mais do que estilo: elas carregam identidade, propósito e uma mensagem de fé em cada costura.
            </p>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light">
              Nós não vendemos apenas camisetas. Nós vestimos atitude. Nós vestimos quem sabe que, mesmo no meio da multidão da cidade, nunca está invisível.
            </p>
          </div>

          {/* Lado da Imagem (Imagem Urbana/Streetwear) */}
          <div className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1000&auto=format&fit=crop" 
              alt="Estilo Streetwear El Roi" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Detalhe estético sobre a imagem */}
            <div className="absolute inset-0 border-8 border-white/10 m-4 rounded-2xl pointer-events-none"></div>
          </div>

        </div>
      </section>

      {/* SEÇÃO DE VALORES (3 Pilares) */}
      <section className="bg-[#1C2E4A] py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-monigue text-5xl md:text-7xl text-[#D9D7CF] tracking-wider mb-4">Nossa Essência</h2>
            <p className="font-collsmith text-3xl text-gray-400">Os três pilares da nossa caminhada</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Pilar 1 */}
            <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="font-monigue text-4xl text-[#D9D7CF] tracking-widest mb-4">Propósito</h3>
              <p className="font-light text-gray-300 leading-relaxed">
                Cada coleção tem uma história. Cada estampa tem uma base bíblica. Você não está apenas se vestindo, está declarando aquilo em que acredita.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors mt-0 md:mt-8">
              <h3 className="font-monigue text-4xl text-[#D9D7CF] tracking-widest mb-4">Qualidade</h3>
              <p className="font-light text-gray-300 leading-relaxed">
                Do fio de algodão ao acabamento da gola. Entregamos o melhor porque servimos ao melhor. Camisetas premium feitas para durar.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors mt-0 md:mt-16">
              <h3 className="font-monigue text-4xl text-[#D9D7CF] tracking-widest mb-4">Atitude</h3>
              <p className="font-light text-gray-300 leading-relaxed">
                O cristão não precisa ser careta. Trazemos a estética urbana das ruas, cortes modernos, oversized e modelagens exclusivas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER / CALL TO ACTION */}
      <section className="bg-black py-20 text-center border-t-[6px] border-[#D9D7CF]">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-collsmith text-4xl md:text-6xl text-[#D9D7CF] mb-10 leading-snug">
            "Para que todos vejam, saibam, considerem e compreendam juntos que a mão do Senhor fez isso."
          </p>
          <Link 
            href="/" 
            className="inline-block bg-[#1C2E4A] text-white border-2 border-[#1C2E4A] hover:bg-transparent hover:text-white hover:border-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-xl"
          >
            Conheça as Coleções
          </Link>
        </div>
      </section>
      
    </div>
  );
}