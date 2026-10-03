/**
 * Catalogo de DEMONSTRACAO (opcional).
 *
 * So e usado quando NEXT_PUBLIC_USE_FALLBACK_PRODUCTS=true E o Stripe nao
 * retornou produtos (vazio, sem chave ou erro). Default: DESLIGADO.
 *
 * Itens de fallback NAO existem no Stripe: nao possuem priceId e nunca podem
 * gerar sessao de checkout. Nao ha precos reais aqui (somente "exemplo").
 */

export const DEMO_ID_PREFIX = 'demo-';
export const DEMO_PRICE_LABEL = 'Preço de exemplo';

export interface CatalogProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  description?: string;
  defaultPriceId?: string | null;
  isDemo?: boolean;
}

export interface FallbackProduct extends CatalogProduct {
  description: string;
  defaultPriceId: null;
  isDemo: true;
}

const demo = (n: number, name: string, description: string): FallbackProduct => ({
  id: `${DEMO_ID_PREFIX}${n}`,
  name: `${name} (exemplo)`,
  imageUrl: `/demo/camiseta-${(n - 1) % 4 + 1}.png`,
  price: DEMO_PRICE_LABEL,
  description: `${description} Produto de demonstração: não está à venda.`,
  defaultPriceId: null,
  isDemo: true,
});

export const FALLBACK_PRODUCTS: readonly FallbackProduct[] = [
  demo(1, 'Camiseta Beyond the Limits', 'Camiseta de exemplo em algodão.'),
  demo(2, 'Camiseta Explorer', 'Camiseta de exemplo com estampa gráfica.'),
  demo(3, 'Camiseta Maratona Ignite', 'Camiseta de exemplo para o dia a dia.'),
  demo(4, 'Camiseta Ignite Lab', 'Camiseta de exemplo, corte regular.'),
  demo(5, 'Camiseta Rocket', 'Camiseta de exemplo, edição de demonstração.'),
  demo(6, 'Camiseta Dev Mode', 'Camiseta de exemplo para devs.'),
  demo(7, 'Camiseta Open Source', 'Camiseta de exemplo, tecido leve.'),
];

export function isFallbackEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.NEXT_PUBLIC_USE_FALLBACK_PRODUCTS === 'true';
}

export function isDemoId(id: string): boolean {
  return id.startsWith(DEMO_ID_PREFIX);
}

export function getFallbackProduct(id: string): FallbackProduct | null {
  return FALLBACK_PRODUCTS.find((p) => p.id === id) ?? null;
}

export interface CatalogResult {
  products: CatalogProduct[];
  isFallback: boolean;
}

/**
 * Busca o catalogo real; usa o fallback apenas se a flag estiver ligada e o
 * Stripe vier vazio ou lancar erro. Com a flag desligada, o comportamento e o
 * original (erro propaga, lista vazia fica vazia).
 */
export async function loadCatalog(
  fetchStripeProducts: () => Promise<CatalogProduct[]>,
  enabled: boolean = isFallbackEnabled(),
): Promise<CatalogResult> {
  try {
    const products = await fetchStripeProducts();
    if (products.length > 0 || !enabled) return { products, isFallback: false };
  } catch (err) {
    if (!enabled) throw err;
    console.warn('[IShop] Stripe indisponível; usando catálogo de demonstração.');
  }
  return { products: [...FALLBACK_PRODUCTS], isFallback: true };
}
