'use server';

import { Database } from "./db";

export async function getProductsAction() {
  return await Database.getProducts();
}
