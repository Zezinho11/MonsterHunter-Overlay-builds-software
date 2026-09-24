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
(CC BY-SA 4.0; see `NOTICE.md` in that folder). They indicate equipment
category, not the named item's exact appearance. Rise and Wilds retain the
neutral category pictogram until comparable game-specific assets are validated.
Talismans and decorations also retain their neutral pictograms where no
appropriate sourced category image is available. All images remain Capcom
game-derived assets; source attribution does not imply Capcom endorsement.
