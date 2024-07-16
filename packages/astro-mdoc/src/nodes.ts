import { parse, type Config } from "@markdoc/markdoc";
import type { AstroConfig } from "astro";
import * as fs from 'node:fs';
import { getMarkdocPath, type MarkdocPath } from "./config";
import { getNamedImport } from "./imports";
import { ACFMap } from "./acf";

const getNodes = async (nodeUrl: URL, root: AstroConfig['root'], isNode: boolean) => {
    let node = {};
    const path = nodeUrl.pathname;
    if(!path || path === "" || path == null || !fs.existsSync(nodeUrl)) return node
    const pathSplit = path.split("/")
    if(fs.existsSync(nodeUrl) && fs.lstatSync(nodeUrl).isDirectory()) {
        const partials = getFilesWithExtentions(nodeUrl, markdocFileRegex)
        await Promise.all(partials.map(async partial => {
            const partialFileName = partial.pathname.split("/")
            const data = await fs.promises.readFile(partial.href.split(root.href)[1], 'utf8')
            Object.assign(node, { [partialFileName[partialFileName.length - 1]]: parse(data)})
        }))
    } else {
        const obj = await import(path);
        const namedImports = getNamedImport(obj);
        for(const namedImport of namedImports) {
            if(isNode) {
                const o = obj[namedImport]
                ACFMap.add(path, namedImport);
                Object.assign(node, { [namedImport] : { ...o, render: namedImport } });
            } else{
                Object.assign(node, { [namedImport]: obj[namedImport] });
            }
        }
    }
    return node;
}

export const markdocUserConfig = async ({ root }: AstroConfig, path?: MarkdocPath): Promise<Config> => {
    const { nodes, tags, partials, variables, functions } = getMDocFiles(root, path);
    const n = await Promise.resolve(getNodes(nodes, root, true))
    const t = await Promise.resolve(getNodes(tags, root, true))
    const p = await Promise.resolve(getNodes(partials, root, false))
    const v = await Promise.resolve(getNodes(variables, root, false))
    const f = await Promise.resolve(getNodes(functions, root, false))
    return {
        nodes: n,
        tags: t,
        partials: p,
        variables: v ,
        functions: f,
    }
}

const getMDocFiles = ( root: AstroConfig['root'], path?: MarkdocPath) => {
    const mdocPath = getMarkdocPath(path);
    const tags: URL = new URL((mdocPath?.tags as string).slice(1), root);
    const nodes: URL = new URL((mdocPath.nodes as string).slice(1), root);
    const partials: URL = new URL((mdocPath.partials as string).slice(1), root);
    const variables: URL = new URL((mdocPath.variables as string).slice(1), root);
    const functions: URL = new URL((mdocPath.functions as string).slice(1), root);
    return { nodes, tags, variables, functions, partials }
}

const markdocFileRegex = /\.(md|mdoc|js|ts|jsx|tsx|mjs|mts|ejs|ets)$/;

const getFilesWithExtentions = (dir: URL, extentions: RegExp) => {
    let markdocFiles: Array<URL> = [];
    if(fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for(const file of files) {
            const filepath = new URL(file, dir);
            if(fs.statSync(filepath).isDirectory()) {
                getFilesWithExtentions(filepath, extentions);
            } else {
                if(extentions.test(filepath.href)) {
                    markdocFiles.push(filepath);
                }
            }
        }
    }
    return markdocFiles;
}