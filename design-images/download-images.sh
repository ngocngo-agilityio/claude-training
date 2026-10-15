#!/bin/bash
# Download the restaurant photos from apps/mock-api/db.json for the mobile design.
cd "$(dirname "$0")"
U="https://images.unsplash.com"
get() { curl -sSL "$U/$2?auto=format&fit=crop&w=$3&q=80" -o "$1" && echo "ok  $1"; }
get dolce-vita.jpg      photo-1517248135467-4c7edcad34c4 700
get petit-jardin.jpg    photo-1414235077428-338989a2e8c0 700
get azure-terrace.jpg   photo-1559339352-11d035aa65de 900
get interior-2.jpg      photo-1550966871-3ed3cdb5ed0c 700
get japanese.jpg        photo-1579871494447-9811cf80d66c 500
get family.jpg          photo-1515003197210-e0cd71810b5f 500
get vegetarian.jpg      photo-1540420773420-3366772f4999 500
get octopus.jpg         photo-1476124369491-e7addf5db371 200
get linguine.jpg        photo-1473093295043-cdd812d0e601 200
echo "Done. Tell Claude the images are ready."
