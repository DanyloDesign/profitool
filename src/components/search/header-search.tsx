"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SearchBox, type SearchBoxProps } from "./search-box";

type HeaderSearchProps = Omit<SearchBoxProps, "defaultValue">;

/**
 * The header field. On /search it shows the query from `?q=`, so the page needs no second field.
 * `useSearchParams` needs a Suspense boundary for the static export; the fallback is the same
 * field, empty. The key remounts the box on every route change: the panel closes and the field
 * clears when the buyer leaves, and picks up the new query on /search.
 */
export function HeaderSearch(props: HeaderSearchProps) {
  return (
    <Suspense fallback={<SearchBox {...props} />}>
      <SearchBoxFromUrl {...props} />
    </Suspense>
  );
}

function SearchBoxFromUrl(props: HeaderSearchProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const onSearchPage = /\/search\/?$/.test(pathname);
  const query = onSearchPage ? (params.get("q")?.trim() ?? "") : "";
  return <SearchBox key={`${pathname}|${query}`} {...props} defaultValue={query} />;
}
