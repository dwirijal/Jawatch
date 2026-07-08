# Sanka Endpoint Ownership Matrix

> Generated from `sanka-openapi-complete.json` (442 paths: anime 236 / comic 191 / novel 15).
> Rule (BLUEPRINT §collision-guard): each path is OWNED by its `{source}`. Calls are provider-namespaced.
> Dedup happens at canonical-slug resolution, never by merging upstream payloads across sources.

## Anime sources (235 paths)

All 235 `/anime/*` paths enumerated. No endpoint declares a non-`application/json` response (content-type sweep found zero). One path is clearly broken; noted below.

```
alqanime
  detail:            /anime/alqanime/detail/{slug}
  search:            /anime/alqanime/search/{query}
  list/home:         /anime/alqanime/home, /anime/alqanime/list, /anime/alqanime/completed, /anime/alqanime/ongoing, /anime/alqanime/popular, /anime/alqanime/movie
  genre:             /anime/alqanime/genre/{slug}, /anime/alqanime/genres
  schedule:          /anime/alqanime/schedule
  season:            /anime/alqanime/season/{slug}

animasu
  detail:            /anime/animasu/detail/{slug}
  search:            /anime/animasu/search/{keyword}
  list/home:         /anime/animasu/home, /anime/animasu/animelist, /anime/animasu/completed, /anime/animasu/ongoing, /anime/animasu/popular, /anime/animasu/latest, /anime/animasu/movies, /anime/animasu/advanced-search
  episode:           /anime/animasu/episode/{slug}
  genre:             /anime/animasu/genre/{slug}, /anime/animasu/genres
  schedule:          /anime/animasu/schedule
  (other)           /anime/animasu/characters, /anime/animasu/character/{slug}

animekompi
  detail:            /anime/animekompi/detail/{slug}
  search:            /anime/animekompi/search, /anime/animekompi/search/suggest
  list/home:         /anime/animekompi/home, /anime/animekompi/list, /anime/animekompi/donghua, /anime/animekompi/live-action, /anime/animekompi/movie, /anime/animekompi/orders, /anime/animekompi/status, /anime/animekompi/filter, /anime/animekompi/filterlist
  episode:           /anime/animekompi/episode/{slug}
  genre:             /anime/animekompi/genre/{slug}, /anime/animekompi/genres
  schedule:          /anime/animekompi/schedule
  season:            /anime/animekompi/season/{slug}, /anime/animekompi/seasons
  (other)           /anime/animekompi/order/{slug}, /anime/animekompi/status/{slug}, /anime/animekompi/studio/{slug}, /anime/animekompi/studios, /anime/animekompi/terbaru, /anime/animekompi/tokusatsu, /anime/animekompi/tooltip/{id}, /anime/animekompi/type/{slug}, /anime/animekompi/types

animekuindo
  detail:            /anime/animekuindo/detail/{slug}
  search:            /anime/animekuindo/search/{query}
  list/home:         /anime/animekuindo/home, /anime/animekuindo/latest, /anime/animekuindo/movie, /anime/animekuindo/popular
  episode:           /anime/animekuindo/episode/{slug}
  genre:             /anime/animekuindo/genres, /anime/animekuindo/genres/{slug}
  schedule:          /anime/animekuindo/schedule
  season:            /anime/animekuindo/seasons, /anime/animekuindo/seasons/{slug}

anoboy
  search:            /anime/anoboy/search/{keyword}
  list/home:         /anime/anoboy/home, /anime/anoboy/list
  episode:           /anime/anoboy/episode/{slug}
  genre:             /anime/anoboy/genre/{slug}, /anime/anoboy/genres
  (other)           /anime/anoboy/anime/{slug}, /anime/anoboy/az-list

donghua
  detail:            /anime/donghua/detail/{slug}
  search:            /anime/donghua/search/{keyword}/{page}   + BROKEN: /anime/donghua/search/Little%20Fairy%20Yao (hardcoded literal query in template)
  episode:           /anime/donghua/episode/{slug}
  genre:             /anime/donghua/genres, /anime/donghua/genres/{slug}/{page}
  schedule:          /anime/donghua/schedule
  season:            /anime/donghua/seasons/{year}
  (other)           /anime/donghua/home/{page}, /anime/donghua/latest/{page}, /anime/donghua/ongoing/{page}, /anime/donghua/completed/{page}, /anime/donghua/az-list/{slug}/{page}

donghub
  detail:            /anime/donghub/detail/{slug}
  search:            /anime/donghub/search/{query}
  list/home:         /anime/donghub/home, /anime/donghub/latest, /anime/donghub/list, /anime/donghub/movie, /anime/donghub/popular
  episode:           /anime/donghub/episode/{slug}
  genre:             /anime/donghub/genre/{slug}
  schedule:          /anime/donghub/schedule

drachin
  detail:            /anime/drachin/detail/{slug}
  search:            /anime/drachin/search/{query}
  list/home:         /anime/drachin/home, /anime/drachin/latest, /anime/drachin/popular
  episode:           /anime/drachin/episode/{slug}

dramabox
  detail:            /anime/dramabox/detail        (NO {slug} placeholder — relies on query param; not a true detail path template)
  search:            /anime/dramabox/search        (NO {query} placeholder)
  list/home:         /anime/dramabox/latest
  (other)           /anime/dramabox/trending, /anime/dramabox/stream, /anime/dramabox/auth/refresh

kura
  search:            /anime/kura/search/{keyword}
  list/home:         /anime/kura/home, /anime/kura/quick/donghua, /anime/kura/quick/movie, /anime/kura/quick/ongoing, /anime/kura/quick/popular, /anime/kura/quick/finished, /anime/kura/properties/studio, /anime/kura/anime-list
  genre:             /anime/kura/properties/genre, /anime/kura/properties/genre/{slug}
  schedule:          /anime/kura/schedule
  season:            /anime/kura/properties/season, /anime/kura/properties/season/{slug}
  (other)           /anime/kura/anime/{id}/{slug}, /anime/kura/watch/{id}/{slug}/{episode}, /anime/kura/batch/{id}/{slug}/{batchId}, /anime/kura/properties/{country,source,quality,type}[/{slug}]

kusonime
  detail:            /anime/kusonime/detail/{slug}
  search:            /anime/kusonime/search/{query}
  list/home:         /anime/kusonime/latest, /anime/kusonime/movie
  genre:             /anime/kusonime/genre/{slug}, /anime/kusonime/all-genres
  season:            /anime/kusonime/all-seasons, /anime/kusonime/season/{season}/{year}
  (other)           /anime/kusonime/all-anime, /anime/kusonime/type/{type}

neko
  search:            /anime/neko/search/{query}
  list/home:         /anime/neko/latest, /anime/neko/release/{page}
  (other)           /anime/neko/get, /anime/neko/random

nimegami
  detail:            /anime/nimegami/detail/{slug}
  search:            /anime/nimegami/search/{query}
  list/home:         /anime/nimegami/home, /anime/nimegami/live-action
  genre:             /anime/nimegami/genre/{slug}
  season:            /anime/nimegami/seasons/{slug}
  (other)           /anime/nimegami/anime-list, /anime/nimegami/j-drama, /anime/nimegami/drama/{slug}, /anime/nimegami/live-action/{slug}, /anime/nimegami/type/{slug}

oploverz
  search:            /anime/oploverz/search/{query}
  list/home:         /anime/oploverz/home, /anime/oploverz/list, /anime/oploverz/ongoing, /anime/oploverz/completed
  episode:           /anime/oploverz/episode/{slug}
  schedule:          /anime/oploverz/schedule
  (other)           /anime/oploverz/anime/{slug}

samehadaku
  search:            /anime/samehadaku/search
  list/home:         /anime/samehadaku/home, /anime/samehadaku/list, /anime/samehadaku/ongoing, /anime/samehadaku/completed, /anime/samehadaku/popular, /anime/samehadaku/movies
  episode:           /anime/samehadaku/episode/{episodeId}
  genre:             /anime/samehadaku/genres, /anime/samehadaku/genres/{genreId}
  schedule:          /anime/samehadaku/schedule
  (other)           /anime/samehadaku/anime/{animeId}, /anime/samehadaku/batch, /anime/samehadaku/batch/{batchId}, /anime/samehadaku/recent, /anime/samehadaku/server/{serverId}

stream
  search:            /anime/stream/search/{query}
  list/home:         /anime/stream/home(no)→ /anime/stream/latest, /anime/stream/list, /anime/stream/popular, /anime/stream/movie/{page}, /anime/stream/latest/{page}
  episode:           /anime/stream/episode/{slug}
  genre:             /anime/stream/genres, /anime/stream/genres/{slug}/{page}
  schedule:          /anime/stream/schedule
  (other)           /anime/stream/anime/{slug}

winbu
  search:            /anime/winbu/search
  list/home:         /anime/winbu/home, /anime/winbu/list, /anime/winbu/ongoing, /anime/winbu/completed, /anime/winbu/latest, /anime/winbu/populer, /anime/winbu/all-anime, /anime/winbu/all-anime-reverse, /anime/winbu/catalog, /anime/winbu/series, /anime/winbu/film, /anime/winbu/tvshow, /anime/winbu/animedonghua, /anime/winbu/others, /anime/winbu/update
  episode:           /anime/winbu/episode/{id}
  genre:             /anime/winbu/genre/{slug}, /anime/winbu/genres
  schedule:          /anime/winbu/schedule
  (other)           /anime/winbu/anime/{id}, /anime/winbu/series/{id}, /anime/winbu/film/{id}, /anime/winbu/server
```

Non-source (generic) roots also present, excluded as not anime-source trees: `/anime/anime/{id}`, `/anime/batch/{id}`, `/anime/complete-anime[/{page}]`, `/anime/genre[/{genre}]`, `/anime/home`, `/anime/ongoing-anime`, `/anime/schedule`, `/anime/search[/{keyword}]`, `/anime/server/{serverId}`, `/anime/episode/{id}`, `/anime/genre/{genre}`, `/anime/unlimited`.

Detail endpoints (with template): alqanime, animasu, animekompi, animekuindo, donghua, donghub, drachin, kusonime, nimegami — all `/anime/{src}/detail/{slug}`.
Sources with NO detail endpoint: anoboy, oploverz, samehadaku, stream, winbu, neko, kura (kura uses `/anime/kura/anime/{id}/{slug}` instead), dramabox (broken detail w/o slug).

Non-JSON / broken / duplicate flags:
- BROKEN: `/anime/donghua/search/Little%20Fairy%20Yao` — hardcoded literal query embedded in URL template (sibling collision with `/anime/donghua/search/{keyword}/{page}`).
- BROKEN/INCOMPLETE: `/anime/dramabox/detail` and `/anime/dramabox/search` — no `{slug}`/`{query}` path param; depend on query-string params, so not usable as path-template detail/search.
- DUPLICATE-OVERLOAD (common, not errors): genre list vs `genre/{slug}` overloads on samehadaku (`genres`/`genres/{genreId}`), animekuindo (`genres`/`genres/{slug}`), stream (`genres`/`genres/{slug}/{page}`). These are valid param-overloads, not duplicates.
- No endpoint returns non-JSON (all `application/json` content-type declared).

## Comic sources (190 paths)

Parsed all 19 `/comic/{source}/` trees (190 paths). `chapter`/`comic`/`genre`/`type` are aggregate pseudo-roots, not scrapers. `nekopoi` absent from spec. NSFW-class present: **mangasusuku**.

```
bacakomik (SFW)
  detail : /comic/bacakomik/detail/{slug}
  chapter: /comic/bacakomik/chapter/{slug}
  search : /comic/bacakomik/search/{query}
  list   : /comic/bacakomik/list
  latest : /comic/bacakomik/latest
  popular: /comic/bacakomik/populer
  home   : /comic/bacakomik/top, /comic/bacakomik/recomen
  genre  : /comic/bacakomik/genres, /comic/bacakomik/genre/{genre}
  extra  : /comic/bacakomik/komikberwarna/{page}, /comic/bacakomik/only/{type}

bacaman (SFW)
  detail : /comic/bacaman/detail/{slug}
  chapter: /comic/bacaman/chapter/{slug}
  search : /comic/bacaman/search/{query}
  list   : /comic/bacaman/list
  latest : /comic/bacaman/latest, /comic/bacaman/update, /comic/bacaman/Update
  popular: /comic/bacaman/popular
  home   : /comic/bacaman/home
  genre  : /comic/bacaman/genres, /comic/bacaman/genres/{slug}, /comic/bacaman/genre/action
  extra  : /comic/bacaman/az, /comic/bacaman/az/{page}, /comic/bacaman/completed, /comic/bacaman/type/{type}

berwarna (SFW, single-page list only)
  list   : /comic/berwarna/{page}

cosmic (SFW)
  detail : /comic/cosmic/manga/{slug}
  chapter: /comic/cosmic/chapter/{slug}
  search : /comic/cosmic/search/{query}/{page}, /comic/cosmic/search/lookism
  latest : /comic/cosmic/latest, /comic/cosmic/latest/{page}
  home   : /comic/cosmic/home
  list   : /comic/cosmic/projects, /comic/cosmic/projects/{page}

kiryuu (SFW)
  detail : /comic/kiryuu/manga/{slug}
  chapter: /comic/kiryuu/chapter/{slug}
  search : /comic/kiryuu/search/{query}/{page}, /comic/kiryuu/search/one piece
  latest : /comic/kiryuu/latest
  popular: /comic/kiryuu/popular
  home   : /comic/kiryuu/home
  list   : /comic/kiryuu/top-weekly
  extra  : /comic/kiryuu/recommendations

komikindo (SFW)
  detail : /comic/komikindo/detail/{id}
  chapter: /comic/komikindo/chapter/{id}
  search : /comic/komikindo/search/{query}/{page}
  latest : /comic/komikindo/latest/{page}
  popular: /comic/komikindo/populer/{page}
  list   : /comic/komikindo/list
  genre  : /comic/komikindo/genres
  extra  : /comic/komikindo/colorized/{val}/{page}, /comic/komikindo/config, /comic/komikindo/filter/{term}/{val}/{page}, /comic/komikindo/library, /comic/komikindo/type/{type}/{page}

komikstation (SFW)
  detail : /comic/komikstation/manga/{slug}
  chapter: /comic/komikstation/chapter/{slug}
  search : /comic/komikstation/search/{query}/{page}, /comic/komikstation/search/naruto
  latest : (none — uses home/ongoing)
  popular: /comic/komikstation/popular
  home   : /comic/komikstation/home, /comic/komikstation/ongoing
  list   : /comic/komikstation/list, /comic/komikstation/az-list/{letter}
  genre  : /comic/komikstation/genres, /comic/komikstation/genre/{slug}/{page}, /comic/komikstation/genre/action
  extra  : /comic/komikstation/top-weekly, /comic/komikstation/recommendation

maid (SFW)
  detail : /comic/maid/manga, /comic/maid/manga/onii-chan-wa-oshimai
  chapter: /comic/maid/chapter, /comic/maid/chapter/onii-chan-wa-oshimai-chapter-104-bahasa-indonesia
  search : /comic/maid/search, /comic/maid/search/{slug}&page=
  latest : /comic/maid/latest
  list   : /comic/maid/list
  genre  : /comic/maid/genres, /comic/maid/genres/{slug}
  extra  : /comic/maid/api

mangakita (SFW)
  detail : /comic/mangakita/detail/{slug}
  chapter: /comic/mangakita/chapter/{slug}
  search : /comic/mangakita/search/{query}/{page}, /comic/mangakita/search/one%20piece
  latest : /comic/mangakita/daftar-manga, /comic/mangakita/daftar-manga/{page}
  popular: (none)
  home   : /comic/mangakita/home
  list   : /comic/mangakita/list, /comic/mangakita/projects, /comic/mangakita/projects/{page}
  genre  : /comic/mangakita/genres, /comic/mangakita/genres/{slug}/{page}, /comic/mangakita/genres/action
  extra  : /comic/mangakita/rekomendasi

mangasusuku (*** NSFW-class ***)
  detail : /comic/mangasusuku/detail/{slug}
  chapter: /comic/mangasusuku/chapter/{slug}
  search : /comic/mangasusuku/search/{query}/{page}, /comic/mangasusuku/search/A+Bachelor+in+the+Country
  latest : /comic/mangasusuku/latest, /comic/mangasusuku/latest/{page}
  popular: /comic/mangasusuku/popular, /comic/mangasusuku/popular/{page}
  home   : /comic/mangasusuku/home, /comic/mangasusuku/home/{page}
  list   : /comic/mangasusuku/list, /comic/mangasusuku/list/{page}, /comic/mangasusuku/list-by-char/{char}/{page}, /comic/mangasusuku/list-by-char/A
  genre  : /comic/mangasusuku/genres, /comic/mangasusuku/genre/{genreId}/{page}, /comic/mangasusuku/genre/21

meganei (SFW)
  detail : /comic/meganei/info/{slug}
  search : /comic/meganei/search/{query}
  latest : (none)
  home   : /comic/meganei/home/{page}
  list   : /comic/meganei/list

pustaka (SFW, single-page list only)
  list   : /comic/pustaka/{page}

softkomik (SFW)
  detail : /comic/softkomik/detail/{slug}
  chapter: /comic/softkomik/chapter/{slug}/{ch}
  search : /comic/softkomik/search
  latest : /comic/softkomik/update
  popular: (none)
  home   : /comic/softkomik/home
  list   : /comic/softkomik/list, /comic/softkomik/completed, /comic/softkomik/ongoing
  genre  : /comic/softkomik/genres, /comic/softkomik/genre/{name}
  extra  : /comic/softkomik/library, /comic/softkomik/type/{type}

soulscan (SFW)
  detail : /comic/soulscan/detail/{slug}
  chapter: /comic/soulscan/chapter/{slug}
  search : /comic/soulscan/search/{query}
  latest : (none)
  popular: (none)
  home   : /comic/soulscan/home
  list   : /comic/soulscan/list, /comic/soulscan/all, /comic/soulscan/azlist/{letter}, /comic/soulscan/projects, /comic/soulscan/projects/{page}

westmanga (SFW)
  detail : /comic/westmanga/detail/{slug}
  chapter: /comic/westmanga/chapter/{slug}
  search : /comic/westmanga/search
  latest : /comic/westmanga/latest, /comic/westmanga/added
  popular: /comic/westmanga/popular
  home   : /comic/westmanga/home, /comic/westmanga/ongoing
  list   : /comic/westmanga/list, /comic/westmanga/manga, /comic/westmanga/manhua, /comic/westmanga/manhwa, /comic/westmanga/others, /comic/westmanga/az, /comic/westmanga/za
  genre  : /comic/westmanga/genres, /comic/westmanga/genre/{id}, /comic/westmanga/genres-filter
  extra  : /comic/westmanga/colored, /comic/westmanga/uncolored, /comic/westmanga/projects

AGGREGATE (not sources — top-level):
  /comic/chapter/{slug}, /comic/chapter/{slug}/navigation
  /comic/comic/{id}, /comic/comic/chapter/{id}
  /comic/genre/{genre}
  /comic/type/{type}
```

Notes:
- Detail templates vary: `{slug}` (maid/kiryuu/mangakita/etc), `{id}` (komikindo, comic/*), `manga/{slug}` (cosmic/kiryuu/komikstation), `info/{slug}` (meganei), `manga`+subpath (maid).
- Chapter templates: `{slug}` standard; softkomik adds `/{ch}` segment; komikindo uses `{id}`.
- Search templates: `{query}` (most), `{query}/{page}` (paged), maid uses broken `/{slug}&page=` literal.
- NSFW flag: **mangasusuku** only (per your lead). nekopoi absent from spec. meganei has no latest/home-list pair but is SFW.

## Novel sources

Only one source (`sakuranovel`) carries a `{source}` segment; the remaining `/novel/*` paths are source-less (generic). Exhaustive.

```
sakuranovel:
  home:    /novel/sakuranovel/home
  detail:  /novel/sakuranovel/detail/{slug}
  search:  /novel/sakuranovel/search
  search:  /novel/sakuranovel/advanced-search
  chapter: /novel/sakuranovel/read/{slug}
  genre:   /novel/sakuranovel/genres
  genre:   /novel/sakuranovel/genre/{slug}
  # not in requested buckets, exist:
  list:    /novel/sakuranovel/daftar-novel
  tag:     /novel/sakuranovel/tags
  tag:     /novel/sakuranovel/tag/{slug}
```

Source-less `/novel/*` (not `{/source}`): `/novel/home`, `/novel/search`, `/novel/chapters/{novelId}`, `/novel/genre/{id}`, `/novel/hot-search`. → skipped: other sources (none present in spec), add when Sanka adds more providers.

## Collision-guard summary
- NSFW-class comic source: **mangasusuku** (mark nsfw=true; exclude from surface until 21+ gate).
- nekopoi: **absent** from spec — do not plan for it yet.
- All endpoints declare application/json; no non-JSON responses.
- Broken paths (hardcoded literal / missing placeholder) are IGNORED per directive.
- Every path is source-owned; each plan names the EXACT provider-prefixed path it calls.
