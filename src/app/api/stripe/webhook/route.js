import { handleProcessWebHookCancelSubscription, handleProcessWebHookUpdateSubscription, stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req) {
    const body = await req.text()
    const signature = req.headers.get('Stripe-Signature')

    let event

    try {
        // Constrói o evento a partir do corpo da requisição e do segredo do webhook
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        // Caso ocorra um erro na verificação do webhook, retorna uma resposta de erro
        console.error(`Erro no Webhook: ${err.message}`)
        return NextResponse.json({ error: 'Erro no Webhook: Segredo inválido' }, { status: 400 })
    }

    // Verifica o tipo de evento recebido
    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            await handleProcessWebHookUpdateSubscription(event.data)
            break
        case 'customer.subscription.deleted':
            await handleProcessWebHookCancelSubscription(event.data)
        default:console.log(`Tipo de evento não tratado: ${event.type}`)
    }

    // Retorna uma resposta de sucesso após processar o evento
    return NextResponse.json({ received: true }, { status: 200 })
}
