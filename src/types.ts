export type ItemKind = "drink" | "dessert" | "merch" | "fee";

export interface OrderItem {
  rawName: string;
  productId: string | null;
  quantity: number;
  kind: ItemKind;
}

export interface Order {
  id: string;
  date: string;
  store: string;
  city: string;
  channel: string;
  amount: number;
  orderType: string;
  items: OrderItem[];
}

export interface Product {
  id: string;
  name: string;
  version: string;
  series: string;
  year: number;
  cupCount: number;
  orderCount: number;
  firstPurchased?: string;
  lastPurchased?: string;
  stores: string[];
  cities: string[];
  image?: string;
  imageStatus: "official" | "verified" | "illustrated" | "placeholder";
  source?: string;
  availability?: string;
  color: string;
}

export interface StoreLocation {
  name: string;
  city: string;
  longitude: number;
  latitude: number;
  visits: number;
}
