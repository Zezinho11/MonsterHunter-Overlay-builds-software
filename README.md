# Monster Hunter Overlay & Builds

Prova de conceito desktop para o companion de Monster Hunter World, Rise e Wilds.

## Executar como aplicativo Windows

O usuário final não precisa instalar Node.js, npm ou executar comandos. Os artefatos gerados ficam em `release`:

- `Monster Hunter Companion-0.1.0-x64-setup.exe`: instalador com atalhos do Windows;
- `Monster Hunter Companion-0.1.0-x64-portable.exe`: versão portátil, sem instalação.

Abra um desses executáveis para iniciar o aplicativo desktop.

## Executar a partir do código-fonte

Esse fluxo é destinado somente ao desenvolvimento. Requer Node.js e npm:

```powershell
npm install
npm start
```

O protótipo abre um painel de configuração e um overlay transparente com dados simulados. Ele demonstra:

- janela sempre no topo;
- modo de edição;
- clique-pass-through;
- ajuste de opacidade;
- movimento e redimensionamento da janela;
- barra de vida do monstro;
- barras de partes quebráveis/cortáveis;
- medidor de dano por caçador;
- DPS, percentual, dano total e gráfico em tempo real.

O renderer nativo de produção está planejado para Direct3D 11 + DirectComposition. Nesta etapa, Electron é usado somente para validar a experiência visual e o contrato de dados. A fixture usada fica em `src/fixtures/simulated-overlay-v1.json`.

O aplicativo empacotado detecta os processos suportados quando estão abertos, mas ainda não libera telemetria real: não há leitura de memória, injeção, plugin, scraping ou conexão de dados do jogo nesta etapa. Os widgets continuam em modo fixture até um adaptador versionado e somente leitura ser validado.
