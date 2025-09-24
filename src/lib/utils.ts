import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// lib/api.ts
export async function createPurchase(purchaseData: any) {
  const res = await fetch('/api/purchases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(purchaseData),
  });

  if (!res.ok) {
    throw new Error('Failed to create purchase');
  }

  return await res.json();
}
