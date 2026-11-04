This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Extração de anúncios por imagem

Para habilitar a extração de nome, categoria, preço, descrição e contato com o Gemini, configure `GEMINI_API_KEY` no arquivo `.env.local` na raiz do projeto:

```env
GEMINI_API_KEY=sua_chave_da_api
```

Essa variável é usada somente no servidor. Não use o prefixo `NEXT_PUBLIC_` nem compartilhe a chave no código-fonte.

## API e permissões

Configure `NEXT_PUBLIC_API_URL` no `.env.local` com o endereço da API NestJS. As telas de anúncios, perfil e comércio carregam e salvam os dados por essa API; sem essa configuração, as solicitações não funcionam.

O cliente só exibe a fila de moderação para contas com papel `moderator` ou `admin`, e exige uma sessão autenticada para publicar. A API NestJS também deve validar essas permissões no servidor, especialmente nas rotas de moderação e de publicação; a proteção da interface não substitui a autorização da API.

Para conceder o primeiro acesso de administrador, crie e confirme a conta normalmente e atualize o papel do perfil correspondente no SQL Editor do Supabase. O procedimento e os endpoints administrativos estão documentados no README da API. Depois, entre novamente no BKO para abrir a área **Usuários**.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
