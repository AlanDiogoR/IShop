import { GetStaticPaths, GetStaticProps } from 'next';
import axios from 'axios';
import Image from 'next/image';

import Stripe from 'stripe';
import { stripe } from '../../lib/stripe';
import { ImageContainer, ProductContainer, ProductDetails } from '../../styles/pages/product';
import { useState } from 'react';
import { getFallbackProduct, isDemoId, isFallbackEnabled } from '../../lib/fallbackProducts';

interface ProducProps {
  product: {
    id: string,
    name: string,
    imageUrl: string,
    price: string,
    description: string,
    defaultPriceId: string | null,
    isDemo?: boolean,
  }
}

export default function Product( { product }:ProducProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false);

  async function handleBuyProduct() {
    if (product.isDemo || !product.defaultPriceId) return;
    try {
      setIsCreatingCheckoutSession(true);
      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      });

      const { checkoutUrl } = response.data;

      window.location.href = checkoutUrl;

    } catch (err) {
      setIsCreatingCheckoutSession(false);
      alert('Falha ao redirecionar ao checkout');

    }
  }

  return (
    <ProductContainer>
      <ImageContainer>
        <Image
          src={product.imageUrl}
          width={520}
          height={480}
          alt=''
        />
      </ImageContainer>

      <ProductDetails>
        <h1>{product.name}</h1>
        <span>{product.price}</span>
        <p>{product.description}</p>

        {product.isDemo && (
          <p role='status'><small>Catálogo de demonstração — produto de exemplo, não está à venda.</small></p>
        )}

        <button disabled={isCreatingCheckoutSession || product.isDemo} onClick={handleBuyProduct}>
          {product.isDemo ? 'Indisponível (demo)' : 'Comprar agora'}
        </button>
      </ProductDetails>
    </ProductContainer>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const productId = String(params.id);

  // Itens de demonstracao nunca consultam o Stripe (so com a flag ligada).
  if (isDemoId(productId)) {
    const demo = isFallbackEnabled() ? getFallbackProduct(productId) : null;
    if (!demo) return { notFound: true };
    return { props: { product: demo }, revalidate: 60 };
  }

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price.unit_amount / 100),
        description: product.description,
        defaultPriceId: price.id,
      }
    },
    revalidate: 60 * 60 * 1,
  };
};
