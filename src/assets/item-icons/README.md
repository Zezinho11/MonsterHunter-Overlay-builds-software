# Monster Hunter item icons

These are game-style item icons associated with the audited reward records in
`src/data/reward-audit.v1.json`. Each record retains `iconSource` (the source
URL), `iconAsset` (the offline copy) and the reward-data source. Identical image
bytes are stored only once.

Sources: [Kiranico World](https://mhworld.kiranico.com/en/items),
[Kiranico Rise](https://mhrise.kiranico.com/data/items?view=material) and
[Kiranico Wilds](https://mhwilds.kiranico.com/data/items) item pages;
[Gathering Hall Studios MHGenDatabase](https://github.com/gatheringhallstudios/MHGenDatabase) assets; and the 5th-generation icon
collection indexed by [zukan-assets](https://github.com/lazywalker/zukan-assets). When an exact World icon
wasn't exposed by the source page, a game-style category icon was used.

These images depict Monster Hunter game assets. Source-code licenses or site
access do not establish redistribution rights for Capcom artwork. Review
permissions before shipping a public installer containing these assets.

## Build equipment category icons

Registered and online build details prefer the catalog's individual equipment
image. If that image is absent or fails, World uses the category SVGs in
`../build-icons/world/` from [MHW_Icons_SVG](https://github.com/OthelloRhin/MHW_Icons_SVG)
(MIT; copyright Thibault “Othello” Benoit; attribution and license copy are in
that folder). MHGU uses the weapon/armor category PNGs in
`../build-icons/mhgu/`, sourced from
[mhgu-collection-tracker](https://github.com/ArmoredRaven17/mhgu-collection-tracker)
and its credited [Monster Hunter Wiki equipment-icon category](https://monsterhunterwiki.org/wiki/Category:MHGU_Equipment_Icons)
(CC BY-SA 4.0; see `NOTICE.md` in that folder). Rise uses the five armor-slot
and talisman symbols from the wiki-sourced icon set credited by the RAB Rise
builder; see `../build-icons/rise/NOTICE.md` (CC BY-SA 3.0). These are category
icons, not the named item's exact appearance. Rise weapon/decorations and all
Wilds equipment retain the neutral category pictogram until an equivalent
source is validated. All game-derived images remain Capcom-related assets;
source attribution does not imply Capcom endorsement.
