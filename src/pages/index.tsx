import Image from 'next/image';

import { useKeenSlider } from 'keen-slider/react';

import { DemoNotice, HomeContainer, Product } from '../styles/pages/home';

import 'keen-slider/keen-slider.min.css';
import { stripe } from '../lib/stripe';
import { GetStaticProps } from 'next';
import Stripe from 'stripe';
import Link from 'next/link';
import { CatalogProduct, loadCatalog } from '../lib/fallbackProducts';

interface HomeProps {
  products: CatalogProduct[],
  isFallback?: boolean,
}

export default function Home({ products, isFallback = false }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    }
  });

  return (
    <>
      {isFallback && (
        <DemoNotice role='status'>
          Catálogo de demonstração — itens de exemplo, não estão à venda.
        </DemoNotice>
      )}
      <HomeContainer ref={sliderRef} className='keen-slider'>
        {products.map(product => {
          return (
            <Link key={product.id} href={`/product/${product.id}`} prefetch={false}>
              <Product className='keen-slider__slide' >
                <Image src={product.imageUrl} width={520} height={480} alt='' />

                <footer>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </footer>
              </Product>
            </Link>
          );
        })}
      </HomeContainer>
    </>
  );
}

export const getStaticProps: GetStaticProps  = async () => {
  const { products, isFallback } = await loadCatalog(async () => {
    const response = await stripe.products.list({
      expand: ['data.default_price']
    });

    console.log(response.data);

    return response.data.map(product => {
      const price = product.default_price as Stripe.Price;
      return {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price.unit_amount / 100),
      };
    });
  });

  return {
    props: {
      products,
      isFallback,
    },
    // fallback: revalida a cada 1 min para voltar ao Stripe assim que possivel
    revalidate: isFallback ? 60 : 60 * 60 * 2,
  };
};
