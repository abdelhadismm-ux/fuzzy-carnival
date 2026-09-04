/**
 * Shopi — Payment Configuration
 * -----------------------------------------------------------------------------
 * Central configuration for the payment layer.
 *
 * IMPORTANT SECURITY NOTE:
 *   NEVER place API keys / secrets in this (frontend) file. Real gateway
 *   credentials must live server-side. This file only holds *routing* config
 *   (which provider is active, whether integration is ready).
 *
 * When a real Moroccan gateway (CMI, Paypg, arCash, etc.) is available, set:
 *   PaymentConfig.ready = true
 *   PaymentConfig.activeProvider = "online"
 * and implement the provider in payment/online-payment-provider.js.
 */
window.PaymentConfig = window.PaymentConfig || {};

// "online" | "cod" — which provider the checkout currently routes to.
PaymentConfig.activeProvider = "cod";

// False until a real gateway is integrated. When false, online payment shows a
// clearly marked integration-placeholder state and cannot be completed.
PaymentConfig.onlinePaymentReady = false;

// Reference to the configured provider (set up by payment-provider.js).
PaymentConfig.provider = null;

// Human-readable labels used by the UI.
PaymentConfig.methods = {
  cod: {
    id: "cod",
    label: "الدفع عند الاستلام",
    description: "ادفع عند استلام طلبك",
    ready: true,
  },
  online: {
    id: "online",
    label: "الدفع الإلكتروني",
    description: "ادفع بأمان باستخدام بطاقتك البنكية",
    ready: PaymentConfig.onlinePaymentReady,
  },
};
