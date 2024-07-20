import type { AstroConfig } from "astro";
import { mdocConfigDefault, type MdocConfig } from "./mdoc";
import * as fs from 'node:fs';
import type { AstroMdocConfig } from "./config";

export const mdocConfigPath = (
    { root, path = mdocConfigDefault }: 
    { 
        root: AstroConfig['root'], 
        path?: MdocConfig
    }) => {
        
}

const ensureMdocDir = (url: URL): boolean => {
    return url && fs.existsSync(url)
}

const nodes = (url: URL): AstroMdocConfig['nodes'] => {
    if(ensureMdocDir(url) && fs.lstatSync(url).isDirectory()) {
        throw new Error(`the given node(${url.pathname}) is not a Markdoc Node`);
    } else if (!ensureMdocDir(url)) {
        throw new Error(`the given node(${url.pathname}) not found.`)
    }


    return {}
}