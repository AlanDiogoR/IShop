# IShop

<p align="center">
  <img src="src/assets/Logo.png" alt="Logo IShop" height="100"/>
</p>

Loja virtual de camisetas feita em **Next.js** com o **Stripe** como backend: os produtos e preços vêm da conta Stripe e a compra é concluída no Stripe Checkout. Projeto de estudo com foco em geração estática (SSG/ISR) e integração com pagamento.

## Stack

- **Next.js 13** (Pages Router, SSG + ISR, API Routes) com **React 18** e **TypeScript**
- **Stripe** (SDK Node) para catálogo de produtos/preços e sessões de checkout
- **Stitches** (CSS-in-JS) e `@next/font`
- **Keen Slider** para o carrossel de produtos
- **Axios** e **ESLint**

Não há banco de dados: o Stripe é a única fonte de dados.

## Funcionalidades

Verificadas em `src/pages` e `src/lib`:

- **Home com carrossel de produtos** carregados do Stripe no build (`getStaticProps`), com revalidação a cada 2 horas
- **Página de produto** com rotas dinâmicas (`getStaticPaths` com `fallback: 'blocking'`), revalidada a cada 1 hora, exibindo nome, preço formatado em reais, descrição e imagem
- **Compra via Stripe Checkout:** a API Route `POST /api/checkout` valida o `priceId` (só aceita ids `price_*`), cria a sessão de pagamento e redireciona o usuário
- **Página de sucesso** após o pagamento
- **Catálogo de demonstração opcional:** com `NEXT_PUBLIC_USE_FALLBACK_PRODUCTS=true`, se o Stripe vier vazio ou com erro, a loja mostra produtos de exemplo identificados como demo e não compráveis, revalidando a cada 1 minuto para voltar ao Stripe

## Como rodar

Requisitos: Node.js 18+ (testado com Node 20) e uma conta Stripe com produtos cadastrados (com imagem e preço).

```bash
npm ci
cp .env.example .env.local   # preencha as variáveis abaixo
npm run dev                  # http://localhost:3000
```

Produção:

```bash
npm run build   # requer chave Stripe válida: a home busca os produtos no build
npm start
```

### Variáveis de ambiente

Definidas em `.env.example`:

| Variável | Uso |
|---|---|
| `SRTIPE_SECRET_KEY` | Chave secreta do Stripe (o nome tem um erro de digitação no código e deve ser mantido assim) |
| `NEXT_URL` | URL pública da aplicação, usada nos redirecionamentos de sucesso/cancelamento do checkout |
| `NEXT_PUBLIC_USE_FALLBACK_PRODUCTS` | Opcional. `true` ativa o catálogo de demonstração |

Para rodar em uma VM (bind em `0.0.0.0`, porta e detalhes do fallback), veja [RODAR.md](RODAR.md).

## Estrutura

```
src/
├── pages/
│   ├── index.tsx          # Home com carrossel (SSG/ISR)
│   ├── product/[id].tsx   # Página de produto (SSG/ISR)
│   ├── success.tsx        # Retorno do checkout
│   └── api/checkout.ts    # Cria a sessão no Stripe Checkout
├── lib/
│   ├── stripe.ts          # Cliente Stripe
│   └── fallbackProducts.ts# Catálogo de demonstração opcional
└── styles/                # Stitches (tema e estilos por página)
```
