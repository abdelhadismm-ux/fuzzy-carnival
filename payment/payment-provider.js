/**
 * Shopi — Payment Provider Interface (payment-provider.js)
 * -----------------------------------------------------------------------------
 * Base contract for payment providers. Every provider (COD, online, or a real
 * gateway added later) must expose the same interface so the checkout UI never
 * has to change.
 *
 * Interface contract:
 *   .id            -> string, provider identifier ("cod" | "online" | ...)
 *   .isReady()     -> boolean, whether the provider can complete a payment now
 *   .process(order)-> Promise<{ success, reference?, message?, requiresAction? }>
 *
 * By depending on this interface, a real Moroccan gateway (CMI, Paypg, etc.)
 * can be dropped in by implementing a new provider and setting
 * PaymentConfig.activeProvider — with ZERO checkout UI changes.
 */
window.PaymentProvider = window.PaymentProvider || {};

/**
 * Lightweight helper that throws if an object does not satisfy the contract.
 * Lets us validate future providers and fail fast at dev time.
 */
PaymentProvider.assertValidProvider = function (provider) {
  if (!provider) throw new Error("PaymentProvider: missing provider.");
  if (typeof provider.id !== "string")
    throw new Error("PaymentProvider: provider.id must be a string.");
  if (typeof provider.isReady !== "function")
    throw new Error("PaymentProvider: provider.isReady must be a function.");
  if (typeof provider.process !== "function")
    throw new Error("PaymentProvider: provider.process must be a function.");
};

/**
 * Sets the active provider based on PaymentConfig.activeProvider and exposes it
 * on PaymentConfig.provider.
 */
PaymentProvider.resolve = function () {
  var id = PaymentConfig.activeProvider;
  var provider = null;

  if (id === "cod") provider = window.CODProvider || null;
  else if (id === "online") provider = window.OnlinePaymentProvider || null;
  else provider = window["Provider" + id] || null;

  if (provider) PaymentProvider.assertValidProvider(provider);
  PaymentConfig.provider = provider;
  return provider;
};
