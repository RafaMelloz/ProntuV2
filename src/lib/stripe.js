import Stripe from 'stripe';
import prisma from './prisma';

export const configStripe = {
    stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        plans:{
            free: {
                name: "Plano gratuito",
                priceId: "price_1Q31xB2NQAhIsjZC3gDXWNU1",
                productId: "prod_QurghWkKDOJTJk"
            },
            basic:{
                name: "Plano básico",
                priceId: "price_1Q31xX2NQAhIsjZCa55Xrau4",
                productId: "prod_QurgZfW5987qDk"
            }
        }
    }
}

export const stripe = new Stripe(configStripe.stripe.secretKey || '');

export async function getSubscriptionDetails(subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
}

export async function getLinkForEditPayment(stripeCustomerId) {
    const configuration = await stripe.billingPortal.configurations.create({
        business_profile: {
            privacy_policy_url: 'https://example.com/privacy',
            terms_of_service_url: 'https://example.com/terms',
        },
        features: {
            subscription_update: {
                default_allowed_updates: ['price'],
                enabled: true,
                products: [
                    {
                        product: configStripe.stripe.plans.basic.productId,
                        prices: [configStripe.stripe.plans.basic.priceId], // IDs de preços permitidos
                    }
                ],
            },
            subscription_cancel: {
                enabled: true,
            },
            payment_method_update: {
                enabled: true,
            },
            invoice_history: {
                enabled: true,
            },
        },
    });

    const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_HOST_URL}/inicio/ajustes`,
        configuration: configuration.id,
    });
    return session.url;
}

export const getPlanByPriceId = (priceId) => {
    const plans = configStripe.stripe.plans

    const plan = Object.values(plans).find(plan => plan.priceId === priceId)

    if (!plan) {
        throw new Error("Plano não encontrado")
    }

    return {
        name: plan.name,
    }
}

export const getStripeCustomerByEmail = async (email) =>{
    const customers = await stripe.customers.list({ email })
    console.log(customers);
    
    return customers.data[0]
}

export const createStripeCustomer = async (input) =>{
    
    const customer  = await getStripeCustomerByEmail(input.email)
    if (customer) return customer


    const createdCustomer = await stripe.customers.create({
        email: input.email,
        name: input.name
    })

    const createdCustomerSubscription = await stripe.subscriptions.create({
        customer: createdCustomer.id,
        items: [
            {price: configStripe.stripe.plans.free.priceId}
        ]
    })

    const admin = await prisma.user.findUnique({
        where: {
            email: input.email
        }
    })

    await prisma.clinic.update({
        where:{
            idClinic: admin.idClinic
        },
        data:{
            stripeCustomerId: createdCustomer.id,        
            stripeSubscriptionId: createdCustomerSubscription.id,    
            stripeSubscriptionStatus: createdCustomerSubscription.status,
            stripePriceId: configStripe.stripe.plans.free.priceId,          
        }
    })

    return createdCustomer
}

export const createBillingSession = async (customerEmail, userSubscriptionId) => {
    try {
        // cria cliente no stripe
        const customer = await createStripeCustomer({
            email: customerEmail
        })

        const subscription = await stripe.subscriptionItems.list({
            subscription: userSubscriptionId,
            limit: 1
        })

        const session = await stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: `${process.env.NEXT_PUBLIC_HOST_URL}/planos`,

            flow_data: {
                type: 'subscription_update_confirm',

                after_completion:{
                    type : 'redirect',
                    redirect:{
                        return_url: `${process.env.NEXT_PUBLIC_HOST_URL}/inicio/pacientes`
                    }
                },

                subscription_update_confirm:{
                    subscription: userSubscriptionId,
                    items:[
                        {
                            id: subscription.data[0].id,
                            price: configStripe.stripe.plans.basic.priceId,
                            quantity: 1
                        }
                    ]
                }

            }
        })

        return {
            url: session.url
        }

    } catch (error) {   
        console.log(error)
        throw new Error("Erro ao criar sessão de pagamento");
    }
}

export const createCheckoutSession = async (userId, customerId) => {
    try {
        const customer = await stripe.customers.retrieve(customerId);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            client_reference_id: userId,
            customer: customer.id,
            success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/inicio/ajustes`,
            cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/inicio/ajustes`,
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
        console.log(error)
        throw new Error("Erro ao criar sessão de pagamento");
    }
}



// Webhooks

export const handleProcessWebHookUpdateSubscription = async (event) => {
    const stripeCustomerId = event.object.customer
    const stripeSubscriptionId = event.object.id
    const stripeSubscriptionStatus = event.object.status
    const stripePriceId = event.object.items.data[0].price.id

    const customerExists = await prisma.clinic.findFirst({
        where: {
            OR: [
                {
                    stripeCustomerId
                },
                {
                    stripeSubscriptionId
                }
            ]   
        },
        select:{
            idClinic: true
        }   
    })

    if (!customerExists) {
       throw new Error("Cliente não encontrado")
    }

    await prisma.clinic.update({
        where:{
            idClinic: customerExists.idClinic
        },
        data:{
            alreadyAClient: true,
            stripeCustomerId,
            stripeSubscriptionId,
            stripeSubscriptionStatus,
            stripePriceId
        }
    })
}

export const handleProcessWebHookCancelSubscription = async (event) => {
    const stripeCustomerId = event.object.customer
    const stripeSubscriptionId = event.object.id

    const customerExists = await prisma.clinic.findFirst({
        where: {
            OR: [
                {
                    stripeCustomerId
                },
                {
                    stripeSubscriptionId
                }
            ]
        },
        select: {
            idClinic: true
        }
    })

    if (!customerExists) {
        throw new Error("Cliente não encontrado")
    }

    await prisma.clinic.update({
        where: {
            idClinic: customerExists.idClinic
        },
        data: {
            stripeSubscriptionId,
            stripeSubscriptionStatus: "canceled",
        }
    })
}
