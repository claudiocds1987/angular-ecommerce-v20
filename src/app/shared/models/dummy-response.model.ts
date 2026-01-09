// Esta es la estructura exacta que devuelve la API de cada producto
export interface DummyProduct {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    tags: string[];
    brand: string;
    sku: string;
    weight: number;
    thumbnail: string;
    images: string[];
}

// Esta es la estructura del "paquete" que trae la paginación
export interface DummyResponse {
    products: DummyProduct[];
    total: number;
    skip: number;
    limit: number;
}
