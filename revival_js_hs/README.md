# Galaxy Revival Starter (JS + Haskell)

Minimal starter to begin rebuilding the game from recovered references.

## Structure

- `frontend/` - pure JavaScript client (HTML + Canvas + ES modules)
- `backend-hs/` - Haskell backend starter (Scotty)

## Frontend (pure JS)

Run a static server from `galaxy_game` root (so frontend can read `max_pack_all_versions`):

```bash
cd ..
python3 -m http.server 8080
```

Open: <http://localhost:8080/revival_js_hs/frontend/>

## Backend (Haskell)

Requirements: GHC + Cabal

```bash
cd backend-hs
cabal update
cabal run
```

API defaults to `http://localhost:3001`.

## Next steps

1. Point `AssetRegistry` to folders from your recovered packs.
2. Build dedicated scenes (Login, Planet, Chat, Avatar Picker).
3. Connect frontend fetch calls to Haskell endpoints.
