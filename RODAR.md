# Como rodar o IShop na VM

Requisitos: Node 18+ (testado com Node 20), npm. Nao ha banco de dados (apenas Stripe como backend).

```bash
git clone https://github.com/AlanDiogoR/IShop.git && cd IShop
npm ci

cp .env.example .env.local
# edite .env.local:
#   SRTIPE_SECRET_KEY=sk_test_...        (sim, "SRTIPE" - nome com typo no codigo)
#   NEXT_URL=http://<IP_DA_VM>:3000

npm run build                      # precisa da chave do Stripe valida (a home busca produtos no build)
npx next start -H 0.0.0.0 -p 3000  # producao
# ou, desenvolvimento: npx next dev -H 0.0.0.0 -p 3000
```

Porta: 3000 (libere no firewall/security group da VM). Acesse `http://<IP_DA_VM>:3000`.
Os produtos vem da conta Stripe (precisam ter imagem e preco cadastrados).

## Catalogo de demonstracao (opcional)

Por padrao **desligado** (comportamento original). Para exibir 7 produtos de exemplo quando o Stripe vier vazio, sem chave ou com erro, defina no `.env.local` (ou no ambiente do build/deploy):

```
NEXT_PUBLIC_USE_FALLBACK_PRODUCTS=true
```

- So entra se o Stripe retornar 0 produtos ou der erro; com produtos no Stripe, o fallback e ignorado.
- Mostra aviso "Catalogo de demonstracao"; precos aparecem como "Preco de exemplo" e o botao fica "Indisponivel (demo)".
- Itens demo (`demo-*`) nunca criam sessao Stripe; `/api/checkout` so aceita `price_*`.
- Com fallback ativo a home revalida a cada 1 min para voltar ao Stripe quando ele responder.
- Lista em `src/lib/fallbackProducts.ts`.
