/**
 * Shopi — Cash on Delivery Provider (cod-provider.js)
 * -----------------------------------------------------------------------------
 * Implements the PaymentProvider contract for COD orders. It does not charge
 * anything; it simply records that payment happens on delivery and returns a
 * successful result with an order reference.
 */
window.CODProvider = {
  id: "cod",

  isReady: function () {
    // COD never depends on a gateway — always available.
    return true;
  },

  /**
   * @param {Object} order  A structured order object (see OrderBuilder).
   * @returns {Promise<{success:boolean, reference:string, message:string}>}
   */
  process: function (order) {
    // COD requires no external call. Simulated as an async operation so the UI
    // treats every provider uniformly (await this.process(order)).
    return Promise.resolve({
      success: true,
      reference: "COD-" + order.orderId,
      message: "طلبك مؤكد. ستدفع عند استلام طلبك.",
    });
  },
};
