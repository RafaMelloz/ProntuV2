import Stripe from 'stripe';

export const configStripe = {
    stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY,
        webhookSecret: '',
        plans:{
            basic:{
                priceId: "price_1Q2LP2GkFz575izvyo2exSaB"
            }
        }
    }
}
export const stripe = new Stripe(configStripe.stripe.secretKey || '');



export const getStripeCustomerByEmail = async (email) =>{
    const customers = await stripe.customers.list({ email })
    return customers.data[0]
}

export const createStripeCustomer = async (input) =>{
    let customer  = await getStripeCustomerByEmail(input.email)
    if (customer) return customer


    return stripe.customers.create({
        email: input.email,
        name: input.name
    })

}

export const createCheckoutSession = async (userId, customerEmail) => {
    try {

        // cria cliente no stripe
        let customer = await createStripeCustomer({
            email: customerEmail
        })

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            client_reference_id: userId,
            customer: customer.id,
            success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/inicio/pacientes`,
            cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/planos?success=false`,
            line_items: [
                {
                    price: configStripe.stripe.plans.basic.priceId,
                    quantity: 1
                }
            ]
        })

        return {
            url: session.url
        }

    } catch (error) {   
        throw new Error("Erro ao criar sessão de pagamento");
    }
}
