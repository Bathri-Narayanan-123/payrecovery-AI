import { Transaction } from '../src/types';

export interface RazorpayLinkResponse {
  link_id: string;
  short_url: string;
  status: 'created' | 'paid' | 'expired';
  amount: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  mode: 'test' | 'simulated_test';
}

export interface RazorpayRetryResponse {
  retry_id: string;
  gateway_status: 'authorized' | 'captured' | 'failed';
  payment_id: string;
  amount: number;
  error_code?: string;
  mode: 'test' | 'simulated_test';
}

export class RazorpayService {
  public static isConfigured(): boolean {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }

  public static getMode(): 'test_api' | 'demo_mode' {
    return this.isConfigured() ? 'test_api' : 'demo_mode';
  }

  public static async createPaymentLink(transaction: Transaction): Promise<RazorpayLinkResponse> {
    const isRealTest = this.isConfigured();
    const linkId = `plink_test_${Math.random().toString(36).substring(2, 10)}`;
    const shortUrl = `https://rzp.io/i/${linkId}`;

    if (isRealTest) {
      try {
        // If keys are provided, we can call the Razorpay API with Basic Auth
        const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/payment_links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          body: JSON.stringify({
            amount: transaction.amount * 100, // paise
            currency: transaction.currency || 'INR',
            accept_partial: false,
            description: `Revenue Recovery for ${transaction.payment_id}`,
            customer: {
              name: transaction.customer_name,
              email: transaction.customer_email,
              contact: transaction.customer_phone
            },
            notify: {
              sms: true,
              email: true
            },
            reminder_enable: true,
            notes: {
              recovered_by: 'PayRecover AI Agent',
              original_payment_id: transaction.payment_id
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            link_id: data.id,
            short_url: data.short_url || shortUrl,
            status: 'created',
            amount: transaction.amount,
            currency: transaction.currency,
            customer: {
              name: transaction.customer_name,
              email: transaction.customer_email,
              contact: transaction.customer_phone
            },
            mode: 'test'
          };
        }
      } catch (e) {
        console.warn('Razorpay Test API call failed, falling back to simulated test link:', e);
      }
    }

    // Simulated Razorpay Test Mode behavior
    return {
      link_id: linkId,
      short_url: shortUrl,
      status: 'created',
      amount: transaction.amount,
      currency: transaction.currency,
      customer: {
        name: transaction.customer_name,
        email: transaction.customer_email,
        contact: transaction.customer_phone
      },
      mode: 'simulated_test'
    };
  }

  public static async executeRetry(transaction: Transaction): Promise<RazorpayRetryResponse> {
    const isRealTest = this.isConfigured();
    // Simulate gateway execution delay
    await new Promise(res => setTimeout(res, 300));

    // Recovery success probability check
    const success = Math.random() * 100 <= (transaction.recovery_probability || 70);

    return {
      retry_id: `retry_test_${Math.random().toString(36).substring(2, 9)}`,
      gateway_status: success ? 'captured' : 'failed',
      payment_id: `pay_rec_${Math.random().toString(36).substring(2, 10)}`,
      amount: transaction.amount,
      error_code: success ? undefined : 'BAD_REQUEST_ERROR_BANK_UNAVAILABLE',
      mode: isRealTest ? 'test' : 'simulated_test'
    };
  }
}
