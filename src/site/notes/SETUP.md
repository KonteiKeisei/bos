---
{"dg-publish":true,"permalink":"/setup/"}
---


# Swordcoast Vault — Setup Guide

## CSS Snippets to Install
1. Download **S - Callouts.css** from:
   https://github.com/SlRvb/Obsidian--ITS-Theme/blob/main/Snippets/S%20-%20Callouts.css
   Place it in: `.obsidian/snippets/`

## Recommended Settings
- **Editor → Readable Line Length** → Turn OFF
  (prevents text being squished to center third of screen)
- **Appearance → Theme** → Fancy-a-story
- **Style Settings** → Enable ArtDeco

## Vault Structure
```
Swordcoast-Vault/
├── _templates/          ← Obsidian templates (point Templater here)
│   ├── NPC Template.md
│   ├── Session Template.md
│   ├── Location Template.md
│   ├── PC Template.md
│   └── Faction Template.md
├── Sessions/            ← One file per session
├── NPCs/                ← One file per NPC
├── Locations/           ← One file per location
├── Player Characters/   ← Pre-built for all 9 PCs
├── Factions/            ← One file per faction
├── .obsidian/snippets/  ← CSS snippets
└── Campaign Index.md    ← Master navigation hub
```

## Pre-Built Files
The following PC files are ready to populate:
- Jaques Le Coq (Anthilz)
- Bo Thoruk (Tyler)
- Chandler Harrow (Freight)
- Leonard Halloway (Aristenn)
- Pierre-Jackson Laferreiere (JoJo)


## Template Usage
Point Obsidian's core Templates plugin (or Templater) to the `.templates/` folder.
New notes created in each folder should use the matching template.

---

## Graph View — Keeping It Clean

The vault is structured so links flow **downward** through the hierarchy:

```
Region → City/Town/Place → POI → Organization → Character → Item
```

**To get a readable graph:**

1. Open **Graph View** (Ctrl/Cmd + G)
2. In the **Filters** panel (top-left gear icon), enable **Filters**
3. Under **Files**, add this to the exclusion field:
   ```
   path:Sessions/
   ```
   This removes the 60+ session files, which each link to nearly every character and collapse the hierarchy into a hairball.



**Link hierarchy rules (for new content):**
- **Location files** should only link to other locations or organizations — never directly to characters or items
- **Organization files** link to their member characters
- **Character files** link to their carried items
- **Session files** are excluded from the graph — they can link freely for note-taking
- If a location has a "notable NPC," that NPC belongs in the location's **Key NPCs table as plain text**, not as a wikilink
