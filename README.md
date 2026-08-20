# App Rentrée

PWA familiale pour préparer la rentrée scolaire de façon simple et ludique,
avec HB (mascotte crayon à papier kawaii). Architecture cloud-first :
toutes les données vivent dans Supabase (Postgres + Auth + Storage), pour un
accès multi-appareils et multi-comptes (les deux parents d'un même foyer).

## Stack

- React 19 + Vite + TypeScript, Tailwind CSS v4
- Supabase : Postgres (RLS par foyer), Auth (email/mot de passe), Storage
- React Router, React Query, Framer Motion
- `vite-plugin-pwa` (installable, lecture hors-ligne des dernières données)

Projet Supabase : `app-rentree` (ref `xvssbpjeiipvrjcoajyi`, org
`digitalbeauty's Org`, région `eu-west-3`).

## Démarrage

```bash
npm install
npm run dev
```

Les variables d'environnement Supabase sont dans `.env.local` (non commité).
Si besoin de les régénérer : URL et clé publique via le dashboard Supabase
du projet `app-rentree`, section API.

## Base de données

Le schéma vit dans `supabase/migrations/` (appliqué via l'outil MCP
Supabase). Pour régénérer les types TypeScript après une migration :

```bash
# via l'outil MCP generate_typescript_types, coller le résultat dans
# src/types/database.ts
```

Modèle de données, RLS et RPC : voir les fichiers de migration, commentés en
français. Points clés :

- Isolation stricte par foyer via RLS (`my_foyer_ids()` + policies).
- `create_foyer`, `create_invitation`, `join_foyer_with_code` : RPC
  `SECURITY DEFINER` pour la création de foyer et l'invitation du conjoint.
- Trigger `check_allocation_plafond` : empêche d'attribuer plus que la
  quantité totale d'un article.

## Icônes PWA

Générées depuis `src/assets/hb-icon*.svg` via `scripts/generate-icons.mjs`
(nécessite `sharp`, déjà en devDependency) :

```bash
node scripts/generate-icons.mjs
```

## État du projet

✅ Construit : modèle de données, RLS, auth (email/mdp), invitation d'un
second compte parent au même foyer, onboarding complet (foyer → enfants →
import JSON optionnel → célébration), tableau de bord, écran enfant
(fournitures + matières + attribué), trousse, stock commun, objets
attribuables + allocations (avec plafond), vue "à acheter" consolidée,
budget (dépenses manuelles + historique), réglages (membres, années
scolaires avec report, export JSON, préférences), PWA installable avec
icônes réelles.

🚧 Pas encore construit (volontairement, ordre demandé) : import de liste
par photo/PDF (Edge Function + vision), scan de ticket de caisse (Edge
Function + vision), habillage visuel final / polish animations.
