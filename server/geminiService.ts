import { GoogleGenAI, Type } from '@google/genai';
import { AIAnalysis, RecoveryAction, RiskLevel, Transaction } from '../src/types';

export class GeminiRecoveryService {
  private static getAiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  public static async analyzeTransaction(transaction: Transaction): Promise<AIAnalysis> {
    const ai = this.getAiClient();

    if (ai) {
      try {
        const prompt = `You are PayRecover AI, an expert Revenue Recovery Agent for Indian merchants integrated with payment gateways like Razorpay.
Analyze this failed transaction and decide the optimal recovery strategy:

TRANSACTION DETAILS:
- Payment ID: ${transaction.payment_id}
- Customer Name: ${transaction.customer_name}
- Amount: ₹${transaction.amount} INR
- Payment Method: ${transaction.payment_method}
- Failure Reason: ${transaction.failure_reason}
- Retry Count: ${transaction.retry_count}
- Customer Tier: ${transaction.customer_history.tier}
- Customer Lifetime Spend: ₹${transaction.customer_history.total_spend}
- Successful Past Payments: ${transaction.customer_history.successful_payments_count}
- Past Failure Rate: ${transaction.customer_history.failure_rate_pct}%

DECISION CRITERIA:
1. recovery_probability: 0 to 100 (percentage chance of successfully recovering revenue).
2. risk_level: "low" | "medium" | "high" (risk of customer dissatisfaction or uncollectibility).
3. recommended_action: ONE of ["retry", "payment_link", "reminder", "escalate", "stop"].
   - "retry": For transient timeouts or network glitches when retry_count < 2.
   - "payment_link": For card/netbanking limits, auth drops, or multi-rail alternative payments.
   - "reminder": For insufficient balance or forgotten OTP when customer is reliable.
   - "escalate": For high-value invoices (>= ₹20,000), B2B orders, or persistent declines.
   - "stop": For low probability (<40%), high past default, or repeated failures on small amounts.
4. expected_recovery: amount * (recovery_probability / 100).
5. reason: A concise, merchant-friendly explanation (1-2 sentences) detailing why this probability and action was chosen based on the gateway reason and customer history.

Return your response strictly in the requested JSON structure.`;

        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Gemini API timeout')), 3500)
        );

        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recovery_probability: {
                  type: Type.INTEGER,
                  description: 'Estimated recovery probability between 0 and 100',
                },
                risk_level: {
                  type: Type.STRING,
                  enum: ['low', 'medium', 'high'],
                  description: 'Risk rating for recovery',
                },
                recommended_action: {
                  type: Type.STRING,
                  enum: ['retry', 'payment_link', 'reminder', 'escalate', 'stop'],
                  description: 'Recommended recovery intervention',
                },
                expected_recovery: {
                  type: Type.NUMBER,
                  description: 'Expected recoverable amount in INR',
                },
                reason: {
                  type: Type.STRING,
                  description: 'Merchant-friendly explanation of why this decision was reached',
                },
              },
              required: [
                'recovery_probability',
                'risk_level',
                'recommended_action',
                'expected_recovery',
                'reason',
              ],
            },
          },
        });

        const response = await Promise.race([generatePromise, timeoutPromise]);

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          return {
            recovery_probability: Math.min(100, Math.max(0, Number(parsed.recovery_probability) || 50)),
            risk_level: (parsed.risk_level as RiskLevel) || 'medium',
            recommended_action: (parsed.recommended_action as RecoveryAction) || 'payment_link',
            expected_recovery: Number(parsed.expected_recovery) || Math.round(transaction.amount * 0.5),
            reason: String(parsed.reason || 'AI evaluation based on gateway signals and customer history.'),
            provider: 'gemini',
            analyzed_at: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Gemini AI API call failed or timed out, activating deterministic fallback:', err);
      }
    }

    // Deterministic Fallback Recovery Decision Engine
    return this.deterministicFallback(transaction);
  }

  public static deterministicFallback(transaction: Transaction): AIAnalysis {
    let probability = 60;
    let riskLevel: RiskLevel = 'medium';
    let action: RecoveryAction = 'payment_link';
    let reason = '';

    const { failure_reason, retry_count, amount, customer_history, payment_method } = transaction;

    if (failure_reason === 'timeout' || failure_reason === 'technical_error') {
      if (retry_count === 0) {
        probability = customer_history.tier === 'VIP' ? 92 : 84;
        riskLevel = 'low';
        action = 'retry';
        reason = `High recovery probability (${probability}%): Transient gateway timeout on ${payment_method}. Customer has a ${customer_history.failure_rate_pct}% failure rate; an automated background retry is the safest action.`;
      } else if (retry_count === 1) {
        probability = 76;
        riskLevel = 'low';
        action = 'retry';
        reason = `Retry #1 previously timed out. Secondary gateway dispatch scheduled with alternate bank routing; 76% expected settlement.`;
      } else {
        probability = 54;
        riskLevel = 'medium';
        action = 'payment_link';
        reason = `Repeated network drops after 2 retries. Switching rails from direct ${payment_method} to a multi-channel payment link.`;
      }
    } else if (failure_reason === 'bank_decline') {
      if (amount >= 25000) {
        probability = customer_history.tier === 'VIP' ? 78 : 62;
        riskLevel = customer_history.tier === 'VIP' ? 'medium' : 'high';
        action = 'escalate';
        reason = `Corporate card limit reached on invoice of ₹${amount.toLocaleString('en-IN')}. Escalating to merchant account manager for high-touch collection.`;
      } else {
        probability = customer_history.tier === 'VIP' ? 76 : 65;
        riskLevel = 'medium';
        action = 'payment_link';
        reason = `Issuing bank declined direct debit. Generating a hosted payment link allows customer to pay via UPI or Netbanking alternative.`;
      }
    } else if (failure_reason === 'insufficient_funds') {
      if (customer_history.tier === 'VIP' || customer_history.successful_payments_count >= 5) {
        probability = 68;
        riskLevel = 'medium';
        action = 'reminder';
        reason = `Customer has ${customer_history.successful_payments_count} successful past transactions. Sending a polite WhatsApp/SMS payment reminder yields 68% recovery.`;
      } else if (retry_count >= 2 || customer_history.failure_rate_pct > 50) {
        probability = 24;
        riskLevel = 'high';
        action = 'stop';
        reason = `Low recovery probability (24%): Repeated balance shortfalls with thin payment history. Ceasing automation to prevent merchant fee waste.`;
      } else {
        probability = 48;
        riskLevel = 'high';
        action = 'reminder';
        reason = `Low balance detected on checkout. Scheduled reminder dispatched after 4 hours for salary account replenishment.`;
      }
    } else if (failure_reason === 'authentication_failure') {
      probability = customer_history.tier === 'VIP' ? 82 : 70;
      riskLevel = 'medium';
      action = amount > 15000 ? 'payment_link' : 'reminder';
      reason = `OTP or 3D-Secure authentication session expired. Fresh checkout token via ${action === 'payment_link' ? 'hosted payment link' : 'SMS reminder'} clears 70%+ of cases.`;
    } else {
      if (customer_history.failure_rate_pct > 40) {
        probability = 32;
        riskLevel = 'high';
        action = 'stop';
        reason = `Unresolved payment error with high historical default rate. Stopped to safeguard merchant reputation.`;
      } else {
        probability = 58;
        riskLevel = 'medium';
        action = 'payment_link';
        reason = `Unspecified failure code. Providing dynamic Razorpay payment link with automatic UPI/Card fallbacks.`;
      }
    }

    const expectedRecovery = Math.round((amount * probability) / 100);

    return {
      recovery_probability: probability,
      risk_level: riskLevel,
      recommended_action: action,
      expected_recovery: expectedRecovery,
      reason,
      provider: 'deterministic_fallback',
      analyzed_at: new Date().toISOString(),
    };
  }
}
