# Shard themes

Color themes for [Shard](https://github.com/kinan9011/shard). Add `github.com/kinan9011/shard-themes` in
**Plugins → Repositories**, then install themes in **Settings → Appearance → Custom themes**.

## Themes

| Theme | Modes | Palette |
| --- | --- | --- |
| `nord` | light, dark | [Nord](https://www.nordtheme.com), Arctic Ice Studio |
| `dracula` | dark | [Dracula](https://draculatheme.com), Zeno Rocha |
| `gruvbox` | light, dark | [Gruvbox](https://github.com/morhetz/gruvbox), Pavel Pertsev |
| `tokyo-night` | light (Day), dark | [Tokyo Night](https://github.com/folke/tokyonight.nvim), enkia and folke |
| `catppuccin` | light (Latte), dark (Mocha) | [Catppuccin](https://catppuccin.com), the Catppuccin Org |
| `rose-pine` | light (Dawn), dark | [Rosé Pine](https://rosepinetheme.com), the Rosé Pine contributors |

The palettes belong to their authors and are used under their MIT licenses. Shard needs more colors than a
palette has (borders, sidebar, hover states), so the missing ones are derived. Every color that carries text
is moved just enough to meet Shard's contrast rules: text 4.5:1, form borders 3:1, syntax colors 4.5:1.

## How it fits together

```
themes/<id>.json                 one theme: tokens for light and/or dark (format: docs/themes.md in kinan9011/shard)
index.json                       the catalog Shard reads: every theme with its URL, size and SHA-256
scripts/build-index.mjs          checks the themes and writes index.json
.github/workflows/check.yml      fails a push or pull request when a theme is invalid or index.json is stale
```

## Add or change a theme

1. Add or edit `themes/<id>.json`. The file name is the theme's `id`. Start from
   [`themes/example.json`](https://github.com/kinan9011/shard/blob/main/themes/example.json) in the Shard repository.
   Raise `version` when you change a published theme, so installed copies show **Update**.
2. Run `node scripts/build-index.mjs`. It rejects a theme Shard would refuse (unknown token, bad value, bad id)
   and rewrites `index.json` with the new size and SHA-256.
3. Commit the theme and `index.json` together.

Shard downloads a theme from the `main` branch and refuses it when its size or SHA-256 differs from `index.json`,
so a theme file and `index.json` must always change in the same commit.
