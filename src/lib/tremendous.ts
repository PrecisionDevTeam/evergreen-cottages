export {};

const TREMENDOUS_BASE = "https://www.tremendous.com/api/v2";

// Common product IDs — override via env vars if Tremendous assigns different ones
const PRODUCT_AMAZON = process.env.TREMENDOUS_PRODUCT_AMAZON || "AAZMHYP";
const PRODUCT_STARBUCKS = process.env.TREMENDOUS_PRODUCT_STARBUCKS || "Q24GA3";

export type GiftCardChoice = "amazon_10" | "starbucks_10";

export async function sendGiftCard(params: {
  guestName: string;
  email: string;
  phone?: string;
  choice: GiftCardChoice;
  token: string;
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const apiKey = process.env.TREMENDOUS_API_KEY;
  if (!apiKey) return { success: false, error: "TREMENDOUS_API_KEY not set" };

  const productId = params.choice === "starbucks_10" ? PRODUCT_STARBUCKS : PRODUCT_AMAZON;
  const fundingSourceId = process.env.TREMENDOUS_FUNDING_SOURCE_ID || "BALANCE";

  const body = {
    external_id: `survey-${params.token}`,
    payment: { funding_source_id: fundingSourceId },
    rewards: [
      {
        value: { denomination: 10, currency_code: "USD" },
        recipient: {
          name: params.guestName || "Guest",
          email: params.email,
          ...(params.phone ? { phone: params.phone } : {}),
        },
        delivery: { method: "EMAIL" },
        products: [productId],
      },
    ],
  };

  try {
    const resp = await fetch(`${TREMENDOUS_BASE}/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok) {
      const errMsg = data?.errors?.[0]?.message || data?.error || `HTTP ${resp.status}`;
      console.error("TREMENDOUS_ERROR:", errMsg, JSON.stringify(data));
      return { success: false, error: errMsg };
    }

    const orderId = data?.order?.id as string | undefined;
    console.log("TREMENDOUS_ORDER_SENT:", orderId, params.email, params.choice);
    return { success: true, orderId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("TREMENDOUS_FETCH_ERROR:", msg);
    return { success: false, error: msg };
  }
}
