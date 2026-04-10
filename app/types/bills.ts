export type Bills = {
   id: number;
   customer_id: number;
   admin_id: number;
   service_id: number;
   month: string;
   usage_value: number;
   year: number;
   price: number;
   measurement_number: number;
   paid: boolean;
   owner_token: string;
   createdAt: string;
   updatedAt: string;
}