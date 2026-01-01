import Stripe from "stripe";
import { storage } from "../storage";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY not set - Stripe functionality will be disabled");
}

export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any })
  : null;

export const PRICE_IDS = {
  free: null,
  pro: process.env.STRIPE_PRO_PRICE_ID || null,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
};

export const TIER_PRICES = {
  free: { monthly: 0, name: "Free" },
  pro: { monthly: 9, name: "Pro" },
  enterprise: { monthly: 29, name: "Enterprise" },
};

export async function getOrCreateStripeCustomer(userId: string, email?: string | null): Promise<string | null> {
  if (!stripe) return null;
  
  const user = await storage.getUser(userId);
  
  // If user already has a Stripe customer ID, return it
  if (user?.id) {
    // Check if we have a subscription with a customer ID
    const subscription = await storage.getSubscription(userId);
    if (subscription?.stripeSubscriptionId) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        return stripeSub.customer as string;
      } catch (e) {
        // Subscription not found, create new customer
      }
    }
  }
  
  // Create a new customer
  const customer = await stripe.customers.create({
    email: email || undefined,
    metadata: {
      userId,
    },
  });
  
  return customer.id;
}

export async function createCheckoutSession(
  userId: string,
  tier: "pro" | "enterprise",
  email?: string | null,
  returnUrl?: string
): Promise<string | null> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }
  
  const priceId = PRICE_IDS[tier];
  if (!priceId) {
    throw new Error(`Price ID not configured for tier: ${tier}`);
  }
  
  const customerId = await getOrCreateStripeCustomer(userId, email);
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId || undefined,
    customer_email: !customerId ? (email || undefined) : undefined,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${returnUrl || process.env.APP_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl || process.env.APP_URL}/account?canceled=true`,
    metadata: {
      userId,
      tier,
    },
  });
  
  return session.url;
}

export async function createPortalSession(userId: string, returnUrl?: string): Promise<string | null> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }
  
  const customerId = await getOrCreateStripeCustomer(userId);
  if (!customerId) {
    throw new Error("No Stripe customer found");
  }
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${process.env.APP_URL}/account`,
  });
  
  return session.url;
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier;
      
      if (userId && tier && session.subscription) {
        // Create or update subscription record
        const existingSubscription = await storage.getSubscription(userId);
        
        const subscriptionData = {
          userId,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: PRICE_IDS[tier as keyof typeof PRICE_IDS] || undefined,
          tier,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          cancelAtPeriodEnd: false,
        };
        
        if (existingSubscription) {
          await storage.updateSubscription(existingSubscription.id, subscriptionData);
        } else {
          await storage.createSubscription(subscriptionData);
        }
      }
      break;
    }
    
    case "customer.subscription.updated": {
      const subscription = event.data.object as any;
      const existingSub = await storage.getSubscriptionByStripeId(subscription.id);
      
      if (existingSub) {
        await storage.updateSubscription(existingSub.id, {
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : undefined,
          currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
        });
      }
      break;
    }
    
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const existingSub = await storage.getSubscriptionByStripeId(subscription.id);
      
      if (existingSub) {
        await storage.updateSubscription(existingSub.id, {
          status: "canceled",
        });
      }
      break;
    }
    
    case "invoice.payment_failed": {
      const invoice = event.data.object as any;
      if (invoice.subscription) {
        const existingSub = await storage.getSubscriptionByStripeId(invoice.subscription as string);
        
        if (existingSub) {
          await storage.updateSubscription(existingSub.id, {
            status: "past_due",
          });
        }
      }
      break;
    }
  }
}
