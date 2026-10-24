# Frozen snapshots for the static build

`person/` holds the 23 API answers of the pedestrian tile (sites, and 7/30-day traffic for all
sites and each site), computed from the local Passantendaten archive (data through 2026-10-23).
The archive is frozen, so these files never change. `build-static.mjs` copies them into the
Pages build when `PERSON_DATA_DIR` is not set; the archive itself is not in the repo.

Regenerate: `PERSON_DATA_DIR=<archive>/data node build-static.mjs /tmp/out && cp -r /tmp/out/api/person static-snapshots/`

Licence: the underlying data is proprietary (see `provenance` in each file).
