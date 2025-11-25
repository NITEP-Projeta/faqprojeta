import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // 1. Pega os dados que o Chatwoot enviou
    const dados = await request.json();

    // 2. Mostra no seu terminal o que chegou (para você testar)
    console.log("Recebi um evento do Chatwoot:", dados.event);

    // 3. Responde para o Chatwoot que deu tudo certo
    return NextResponse.json({ ok: true });
}