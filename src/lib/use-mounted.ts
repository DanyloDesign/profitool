import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false на сервере и при гидратации, true после неё. Сторы читают localStorage только на клиенте,
 * поэтому всё, что от них зависит, показываем после этого флага: иначе разъезжается разметка.
 * useSyncExternalStore вместо setState в эффекте: так React отдаёт разные снимки без лишнего рендера.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
