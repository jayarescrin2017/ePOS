export interface StoreSettings {
  name: string;
  address: string;
  contact: string;
  logoUrl?: string;
  footerMessage?: string;
  taxRate: number;
}

export const initialStoreSettings: StoreSettings = {
  name: "Escrin hollowblocks trading",
  address: "123 Industrial Ave, Tech City",
  contact: "(555) 012-3456",
  logoUrl: "",
  footerMessage: "Thank you for your business! Please keep this receipt for returns.",
  taxRate: 0.12,
};
