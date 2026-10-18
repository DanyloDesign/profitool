# Proposal

Remove the city selector from the header (desktop row and phone menu). Without it, the stored city could only be
the Kyiv default, so its other uses go too: checkout pre-fill, the "Місто" row in the account profile, the reset in
the privacy view. Delete `city-select.tsx`, `store/location.ts` and the `nav.city*` and `profile.fieldCity` strings.
The checkout keeps its own required city field.

Bring a city choice back once the backend has Nova Poshta and Ukrposhta APIs (MVP0 3.5): then it can show real
terms, prices and nearby branches.
