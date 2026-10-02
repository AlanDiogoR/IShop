# Como rodar o IShop na VM

Requisitos: Node 18+ (testado com Node 20), npm. Nao ha banco de dados (apenas Stripe como backend).

```bash
git clone https://github.com/AlanDiogoR/IShop.git && cd IShop
git checkout fix/run-on-linux-vm   # ate o PR ser mergeado
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
