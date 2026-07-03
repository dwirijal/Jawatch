# Jawatch

dwizzyOS media stream frontend. Next.js app router. Queries the avicenna API.

## Env

```
NEXT_PUBLIC_API_URL   avicenna base, e.g. http://localhost:8484 (dev) / http://avicenna:8484 (compose)
```

See `.env.example`. Default `http://localhost:8484` if unset.

## Routes

```
/                  home -> getContents
/search            -> searchContents
/read/[id]         -> getFullContent (manga)
/watch/[id]        -> getFullContent (anime)
/sitemap.xml       -> getContents
```

## Run

```
cp .env.example .env.local
npm install
npm run dev      # http://localhost:3000
npm run build
```
