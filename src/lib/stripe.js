import Stripe from 'stripe';
import prisma from './prisma';

export const configStripe = {
    stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: '',
        plans:{
            free:{
                priceId: "price_1Q2dKcGkFz575izvL7r5TRwH"
            },
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

export const createCheckoutSession = async (userId, customerEmail, userSubscriptionId) => {
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

        // const session = await stripe.checkout.sessions.create({
        //     payment_method_types: ['card'],
        //     mode: 'subscription',
        //     client_reference_id: userId,
        //     customer: customer.id,
        //     success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/inicio/pacientes`,
        //     cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/planos?success=false`,
        //     line_items: [
        //         {
        //             price: configStripe.stripe.plans.basic.priceId,
        //             quantity: 1
        //         }
        //     ]
        // })

        return {
            url: session.url
        }

    } catch (error) {   
        console.log(error)
        throw new Error("Erro ao criar sessão de pagamento");
    }
}
