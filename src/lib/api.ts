import type { Order, OrderStatus, Product } from "../types";

const API = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {

  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  const response = await fetch(
    `${API}${url}`,
    {
      ...options,
      headers
    }
  );

  if (!response.ok) {

    let message =
      `Erreur HTTP ${response.status}`;

    try {
      const text = await response.text();

      if (text) {
        message = text;
      }
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

const number = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

function normalizeCustomer(raw: any) {
  if (!raw || typeof raw !== "object") return undefined;

  const nestedCustomer =
    raw.customer ??
    raw.client ??
    raw.customerInfo;

  const hasFlatCustomerFields =
    raw.firstName != null ||
    raw.firstname != null ||
    raw.prenom != null ||
    raw.lastName != null ||
    raw.lastname != null ||
    raw.nom != null ||
    raw.customerName != null ||
    raw.fullName != null ||
    raw.email != null ||
    raw.phone != null ||
    raw.telephone != null ||
    raw.address != null ||
    raw.adresse != null ||
    raw.city != null ||
    raw.ville != null ||
    raw.postalCode != null ||
    raw.zipCode != null ||
    raw.codePostal != null;

  const customer =
    nestedCustomer ??
    (hasFlatCustomerFields ? raw : undefined);

  if (!customer || typeof customer !== "object") {
    return undefined;
  }

  const firstName =
    customer.firstName ??
    customer.firstname ??
    customer.prenom ??
    "";

  const lastName =
    customer.lastName ??
    customer.lastname ??
    customer.nom ??
    "";

  const name =
    customer.name ??
    customer.fullName ??
    customer.customerName ??
    `${firstName} ${lastName}`.trim();

  return {
    id: customer.id,
    firstName,
    lastName,
    name,
    email: customer.email ?? "",
    phone: customer.phone ?? customer.telephone ?? "",
    address: customer.address ?? customer.adresse ?? "",
    city: customer.city ?? customer.ville ?? "",
    postalCode:
      customer.postalCode ??
      customer.zipCode ??
      customer.codePostal ??
      ""
  };
}

function normalizeItem(item: any) {
  return {
    id: item?.id,
    productId: item?.productId ?? item?.product?.id,
    productName: item?.productName ?? item?.name ?? item?.product?.name,
    name: item?.name,
    quantity: number(item?.quantity, 1),
    unitPrice: number(item?.unitPrice ?? item?.unitPriceTnd ?? item?.price),
    price: number(item?.price ?? item?.unitPrice),
    total: number(item?.total ?? item?.totalPrice ?? item?.lineTotal),
    image: item?.image ?? item?.product?.image ?? ""
  };
}

function normalizeOrder(raw: any): Order {
  const customer = normalizeCustomer(raw);
  const itemsRaw = raw?.items ?? raw?.orderItems ?? raw?.products ?? [];
  return {
    ...raw,
    id: number(
      raw?.id ??
      raw?.orderId ??
      raw?.orderID ??
      raw?.order_id
    ),
    orderNumber:
      raw?.orderNumber ??
      raw?.number ??
      String(
        raw?.id ??
        raw?.orderId ??
        raw?.orderID ??
        raw?.order_id ??
        ""
      ),
    status: raw?.status ?? "PENDING",
    paymentStatus: raw?.paymentStatus ?? raw?.payment?.status,
    paymentMethod: raw?.paymentMethod ?? raw?.payment?.method,
    subtotal: number(raw?.subtotal ?? raw?.subTotal),
    deliveryFee: number(raw?.deliveryFee ?? raw?.shippingFee ?? raw?.delivery?.fee),
    total: number(raw?.total ?? raw?.totalAmount),
    currency: raw?.currency ?? "TND",
    createdAt: raw?.createdAt ?? raw?.creationDate ?? raw?.date,
    customer,
    items: Array.isArray(itemsRaw) ? itemsRaw.map(normalizeItem) : []
  };
}

export async function getOrders(): Promise<Order[]> {
  const data = await request<any>("/orders");
  const list = Array.isArray(data) ? data : data?.content ?? data?.orders ?? data?.data ?? [];
  return Array.isArray(list)
    ? list
        .map(normalizeOrder)
        .filter(order => order.id > 0)
    : [];
}

export async function getOrder(id: number): Promise<Order> {
  return normalizeOrder(await request<any>(`/orders/${id}`));
}

const deliveryOrder: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export async function updateOrderStatus(
  id: number,
  status: OrderStatus
): Promise<Order> {
  const current = await getOrder(id);
  const currentStatus = String(current.status || "PENDING").toUpperCase() as OrderStatus;

  if (currentStatus === "DELIVERED" || currentStatus === "CANCELLED") {
    throw new Error("Cette commande est dans un état final et ne peut plus être modifiée.");
  }

  if (status === "CANCELLED") {
    return normalizeOrder(await request<any>(
      `/orders/${id}/status?status=${encodeURIComponent(status)}`,
      { method: "PATCH" }
    ));
  }

  const currentIndex = deliveryOrder.indexOf(currentStatus);
  const nextIndex = deliveryOrder.indexOf(status);
  if (currentIndex < 0 || nextIndex !== currentIndex + 1) {
    throw new Error("Le processus de livraison avance uniquement vers l'étape suivante. Retour en arrière interdit.");
  }

  return normalizeOrder(await request<any>(
    `/orders/${id}/status?status=${encodeURIComponent(status)}`,
    { method: "PATCH" }
  ));
}

function mapProduct(product: any): Product {
  return {
    id: number(product?.id),
    name: product?.name ?? "",
    category: product?.category ?? "",
    scent: product?.scent ?? "",
    price: number(product?.price),
    // Keep the image returned by the backend. Do not replace it with an assumed endpoint.
    image:
      product.image ||
      product.imageUrl ||
      (product.id
        ? `/api/products/${product.id}/image`
        : ""),    stock: number(product?.stock),
    active: product?.active ?? true,
    description: product?.description ?? ""
  };
}

export async function getProducts(): Promise<Product[]> {
  const data = await request<any>("/products");
  const list = Array.isArray(data) ? data : data?.content ?? data?.products ?? data?.data ?? [];
  return Array.isArray(list) ? list.map(mapProduct) : [];
}

export async function getProduct(id: number): Promise<Product> {
  return mapProduct(await request<any>(`/products/${id}`));
}

export async function createProduct(
  product: Omit<Product, "id">,
  imageFile?: File
): Promise<Product> {

  const formData = new FormData();

  formData.append("name", product.name);
  formData.append("category", product.category || "");
  formData.append("scent", product.scent || "");
  formData.append("price", String(product.price));
  formData.append("stock", String(product.stock ?? 0));
  formData.append("active", String(product.active ?? true));
  formData.append("description", product.description || "");

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(
    `${API}/products`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!response.ok) {

    let message =
      `Erreur lors de la création du produit : ${response.status}`;

    try {
      const text = await response.text();

      if (text) {
        message = text;
      }
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  const data = await response.json();

  return mapProduct(data);
}

export async function updateProduct(
  id: number,
  product: Omit<Product, "id">,
  imageFile?: File
): Promise<Product> {

  const formData = new FormData();

  formData.append("name", product.name);
  formData.append("category", product.category || "");
  formData.append("scent", product.scent || "");
  formData.append("price", String(product.price));
  formData.append("stock", String(product.stock ?? 0));
  formData.append("active", String(product.active ?? true));
  formData.append("description", product.description || "");

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(
    `${API}/products/${id}`,
    {
      method: "PUT",
      body: formData
    }
  );

  if (!response.ok) {

    let message =
      `Erreur lors de la modification du produit : ${response.status}`;

    try {
      const text = await response.text();

      if (text) {
        message = text;
      }
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  const data = await response.json();

  return mapProduct(data);
}

export async function deleteProduct(id: number): Promise<void> {
  return request<void>(`/products/${id}`, { method: "DELETE" });
}

export async function markPaymentAsPaid(paymentId: number): Promise<unknown> {
  return request(`/payments/${paymentId}/paid`, { method: "PATCH" });
}

export function getApiUrl() { return API; }
