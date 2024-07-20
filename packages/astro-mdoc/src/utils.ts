import type { AstroConfig } from "astro";
import type { FSPath } from "./mdoc";

export const sanitizeMdocPath = (path: FSPath, root: AstroConfig['root']): URL => {
    return new URL(path, root)
}
