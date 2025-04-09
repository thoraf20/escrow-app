export const processPayment = async (amount: number, buyerId: string) => {
  // Simulate successful payment (in real apps, you'd call the payment provider's API)
  const success = Math.random() > 0.1; // 90% chance of success
  if (!success) throw new Error("Payment failed. Please try again.");

  // Simulate a payment transaction ID
  const transactionId = `PAY-${Math.floor(Math.random() * 1000000)}`;

  return {
    success,
    transactionId,
    message: "Payment processed successfully",
  };
};
