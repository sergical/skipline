export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export const ENABLE_ARTIFICIAL_DELAYS =
  process.env.EXPO_PUBLIC_ENABLE_ARTIFICIAL_DELAYS === "true";

function headers() {
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  return baseHeaders;
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  // Artificial delay for API calls when enabled
  if (ENABLE_ARTIFICIAL_DELAYS) {
    await new Promise((resolve) =>
      setTimeout(resolve, 300 + Math.random() * 700),
    );
  }

  const res = await fetch(url, { headers: headers() });
  const data = (await res.json()) as T;
  return data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  // Artificial delay for API calls when enabled
  if (ENABLE_ARTIFICIAL_DELAYS) {
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000),
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Parse error response
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: `HTTP ${res.status}: ${res.statusText}` };
    }

    const error = new Error(errorData.message || `HTTP ${res.status}`);
    (error as any).response = { data: errorData, status: res.status };
    throw error;
  }

  const data = (await res.json()) as T;
  return data;
}

export type Product = {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  price_cents: number;
  image_url?: string | null;
  inventory?: number | null;
};

export type CartItem = { product_id: number; quantity: number };

export type CheckoutRequest = {
  user_email: string;
  items: CartItem[];
  coupon_code?: string | null;
  address?: string | null;
  payment_token?: string | null;
};

export type CheckoutResponse = {
  order_id: number;
  total_cents: number;
  status: string;
  trace_id?: string | null;
};
