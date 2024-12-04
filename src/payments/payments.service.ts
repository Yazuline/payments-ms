import { Injectable, Req } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { CLIENT_RENEG_LIMIT } from 'tls';
import { env } from 'process';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.stripeSecret)


    async createPaymentSession(paymentSessionDto:PaymentSessionDto) {
        // cobros ,url navegacion
       const {currency, items, orderId}= paymentSessionDto;
       const lineItems = items.map(item=>{
        return{
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                      
                },
                unit_amount: Math.round(item.price *100), // 30 dolares  3000/100 = 30.00
            },
            quantity:item.quantity
        }
       })

        const session = await this.stripe.checkout.sessions.create({
            // colocar ID de la orden
            payment_intent_data: {
                metadata: {
                    orderId:orderId
                }
            },

            line_items: lineItems,
            mode:'payment',
            success_url:envs.stripeSuccessUrl,
            cancel_url:envs.stripeCancelUrl

        })

        return session

    }

    async stripeWebhook(req:Request, res:Response){
        const sig= req.headers['stripe-signature'];
        let event:Stripe.Event;
        const endpointSecret=envs.stripeEndpointSecret
       
        try {
            event=this.stripe.webhooks.constructEvent(req['rawBody'], 
            sig, 
            endpointSecret);
        } catch (err) {

            res.status(400).send(`Webhook Error:${err.message}`) 
            return;           
        }
        

        switch(event.type){
            case 'charge.succeeded':
                const chargeSucceeded=event.data.object;
            // Aqui llamar al microservicio
                console.log({
                    metadata:chargeSucceeded.metadata
                })
            break;
            default:
                console.log(`Evento ${event.type} not `)
        }

        return res.status(200).json({sig})

    }
}
