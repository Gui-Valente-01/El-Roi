'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get('pedido_id');

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-monigue text-3xl text-[#1C2E4A] mb-2">Compra Realizada!</h1>
        <p className="text-gray-500 mb-6">Seu pedido foi recebido e esta sendo processado com sucesso.</p>
        {pedidoId && (
          <p className="text-xs text-gray-400 mb-2">Pedido ID: {pedidoId}</p>
        )}
        <Link
          href="/"
          className="inline-block bg-[#1C2E4A] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#111] transition"
        >
          Voltar para a Loja
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA]" />}>
      <SuccessContent />
    </Suspense>
  );
}
