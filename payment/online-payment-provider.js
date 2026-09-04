/**
 * Shopi — Online Payment Provider (online-payment-provider.js)
 * -----------------------------------------------------------------------------
 * INTEGRATION PLACEHOLDER — NOT READY FOR PRODUCTION.
 *
 * This implements the PaymentProvider contract for online card payments, but
 * until a real Moroccan gateway is connected (CMI, Paypg, arCash, etc.) it
 * cannot complete payments. isReady() therefore returns false, which makes the
 * checkout UI show a clearly marked "integration pending" state and prevents
 * submitting an online order.
 *
 * HOW TO INTEGRATE A REAL GATEWAY (no UI changes required):
 *   1. In payment/payment-config.js set:
 *        PaymentConfig.onlinePaymentReady = true;
 *        PaymentConfig.activeProvider = "online";
 *   2. Replace this process() body to call your gateway via your backend
 *      (NEVER from the browser — keep credentials server-side), e.g.:
 *        return fetch("/api/checkout", { method: "POST", body: JSON.stringify(order) })
 *          .then(r => r.json())
 *          .then(gateway => ({ success: gateway.success, reference: gateway.reference, ... }));
 *   3. The interface stays identical, so index.html/script.js don't change.
 */
window.OnlinePaymentProvider = {
  id: "online",

  isReady: function () {
    // A real gateway has NOT been connected yet.
    return !!PaymentConfig.onlinePaymentReady;
  },

  /**
   * @param {Object} order  A structured order object.
   * @returns {Promise<{success:boolean, reference:string, message:string}>}
   */
  process: function (order) {
    if (!this.isReady()) {
      return Promise.reject(
        new Error(
          "بوابة الدفع الإلكتروني ليست مربوطة بعد. جرب الدفع عند الاستلام."
        )
      );
    }

    // Real gateway call replaces this block once connected (server-side).
    return Promise.resolve({
      success: true,
      reference: "ONLINE-" + order.orderId,
      message: "تم الدفع الإلكتروني بنجاح.",
      requiresAction: false,
    });
  },
};
