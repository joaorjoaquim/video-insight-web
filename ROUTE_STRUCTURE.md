# Nova Estrutura de Rotas - SummaryVideos

## Visão Geral

Esta implementação utiliza **Route Groups** do Next.js 13+ para organizar rotas públicas e privadas de forma limpa e segura, sem expor a estrutura interna nas URLs.

## Estrutura de Pastas

```
src/app/
├── (public)/           # Route Group - Rotas públicas (não aparece na URL)
│   └── page.tsx        # Landing page (acessível via /)
├── (private)/          # Route Group - Rotas privadas (não aparece na URL)
│   ├── layout.tsx      # Layout que protege todas as rotas privadas
│   ├── page.tsx        # Dashboard principal (acessível via /)
│   ├── dashboard/      # Dashboard específico (acessível via /dashboard)
│   │   └── page.tsx
│   ├── wallet/         # Página da carteira (acessível via /wallet)
│   │   └── page.tsx
│   └── submissions/    # Página de submissões (acessível via /submissions)
│       └── page.tsx
└── page.tsx            # Página raiz que decide redirecionamento
```

## URLs Finais

- `/` - Landing page (usuários não autenticados) ou Dashboard (usuários autenticados)
- `/dashboard` - Dashboard específico (apenas usuários autenticados)
- `/wallet` - Página da carteira (apenas usuários autenticados)
- `/submissions` - Página de submissões (apenas usuários autenticados)

## Segurança

### Middleware (`src/middleware.ts`)
- Protege rotas específicas (`/dashboard`, `/wallet`, `/submissions`)
- Verifica token de autenticação em cookies e headers
- Redireciona usuários não autenticados para `/`

### Layout Privado (`src/app/(private)/layout.tsx`)
- Proteção adicional no lado do cliente
- Verifica estado de autenticação do Redux
- Redireciona usuários não autenticados
- Mostra loading state durante verificação

### Página Raiz (`src/app/page.tsx`)
- Decide se mostra landing page ou redireciona para dashboard
- Evita loops infinitos com estado de loading
- Integra landing page diretamente

## Fluxo de Autenticação

1. **Usuário não autenticado acessa `/`**
   - Middleware permite acesso
   - Página raiz mostra landing page
   - Usuário pode fazer login

2. **Usuário autenticado acessa `/`**
   - Middleware permite acesso
   - Página raiz redireciona para `/dashboard`
   - Layout privado verifica autenticação
   - Dashboard é exibido

3. **Usuário não autenticado tenta acessar `/dashboard`**
   - Middleware bloqueia acesso
   - Redireciona para `/`
   - Layout privado também bloqueia (dupla proteção)

4. **Usuário autenticado acessa `/dashboard`**
   - Middleware permite acesso
   - Layout privado verifica autenticação
   - Dashboard é exibido

## Vantagens da Nova Estrutura

### 1. URLs Limpas
- Não expõe estrutura interna (`/public`, `/private`)
- URLs intuitivas e profissionais
- SEO-friendly

### 2. Segurança Robusta
- Proteção no middleware (servidor)
- Proteção no layout (cliente)
- Verificação dupla de autenticação

### 3. Organização Clara
- Separação lógica entre rotas públicas e privadas
- Fácil manutenção e escalabilidade
- Estrutura preparada para crescimento

### 4. Performance
- Route groups não afetam performance
- Lazy loading automático
- Code splitting otimizado

## Adicionando Novas Rotas

### Rotas Privadas
1. Crie a pasta em `src/app/(private)/nova-rota/`
2. Adicione `page.tsx` na pasta
3. Adicione a rota em `PROTECTED_ROUTES` no middleware
4. A rota será acessível via `/nova-rota`

### Rotas Públicas
1. Crie a pasta em `src/app/(public)/nova-rota/`
2. Adicione `page.tsx` na pasta
3. A rota será acessível via `/nova-rota`

## Exemplo de Implementação

```typescript
// src/app/(private)/nova-rota/page.tsx
'use client';
import { useAppSelector } from '../../../core/hooks';

export default function NovaRotaPage() {
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);

  if (!isAuthenticated) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>Nova Rota</h1>
      <p>Bem-vindo, {user.name}!</p>
    </div>
  );
}
```

## Considerações de Segurança

1. **Middleware**: Primeira linha de defesa no servidor
2. **Layout Privado**: Segunda linha de defesa no cliente
3. **Verificação de Estado**: Terceira linha de defesa nos componentes
4. **Tokens**: Armazenados em cookies seguros
5. **Redirecionamentos**: Sempre para rotas seguras

Esta estrutura garante que usuários não autenticados nunca vejam conteúdo privado, mesmo durante estados de carregamento. 