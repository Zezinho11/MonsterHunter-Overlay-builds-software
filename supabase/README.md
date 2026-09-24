# Conta online do Hunter Companion

1. Crie um projeto no Supabase.
2. Em Authentication → Providers, habilite e-mail/senha. Para testes, desative a confirmação obrigatória de e-mail; em produção, mantenha-a ativada e configure o SMTP.
3. Copie `supabase.config.example.json` para `supabase.config.json` dentro da pasta de dados do aplicativo e preencha a URL do projeto e a chave pública `anon`.

No Windows em desenvolvimento, a pasta de dados costuma ser:

`%APPDATA%\hunter-companion`

Também é possível iniciar o aplicativo com `SUPABASE_URL` e `SUPABASE_ANON_KEY` definidos no ambiente. Nunca use a chave `service_role` no executável.

## Galeria pública de builds

Migration `migrations/20260922_community_builds.sql` aplicada ao projeto Hunter Companion em 2026-09-22. Ela cria uma tabela protegida por RLS e uma função REST (`rpc/search_community_builds`) que retorna somente builds publicadas. A chave `anon` é suficiente para buscar; publicar/remover exige sessão autenticada. Não há acesso de cliente à chave `service_role`. Em outros projetos/ambientes, aplique a migration uma vez no SQL Editor.

Uma build local só é enviada depois de o usuário usar “Compartilhar publicamente” e confirmar a publicação. O e-mail não é armazenado nem exposto; as notas privadas são omitidas. O usuário pode remover sua publicação sem apagar a build local. Para restaurar essa função após reinstalar, basta manter o mesmo projeto Supabase configurado.

`migrations/20260922_community_build_equipment_slots.sql` amplia somente a lista de campos públicos permitidos para incluir ID/skills/slots do talismã e decorações encaixadas por peça. Foi aplicada ao projeto Hunter Companion em 2026-09-22. Em outros projetos/ambientes, aplique-a uma vez no SQL Editor. A migration não republica builds antigas; novas publicações/atualizações continuam opt-in, e notas, e-mail e metadados privados permanecem excluídos.

Para validar somente leitura pública, execute `npm run builds:community-audit`. O teste consulta a RPC sem sessão, confere filtros por jogo e campos retornados, confirma que a tabela não permite SELECT anônimo e verifica a tela Builds online. Ele não cria, atualiza nem remove builds; requer a configuração local normal do Supabase ou `SUPABASE_CONFIG_PATH`.

A integração mantém o perfil local como fallback quando a configuração não existe ou a rede está indisponível. A sincronização de favoritos e builds será adicionada sobre a mesma sessão na próxima etapa.
