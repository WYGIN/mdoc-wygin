import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { AstroMdocConfig } from './config';
import type { Config, NodeType, Schema } from '@markdoc/markdoc';
import { getNamedImport } from './imports';
import * as fs from 'node:fs';

export const MdocConfig = (props: AstroMdocConfig): Config => {
    let config: Config = props;
    for(const key in props.nodes) {
        const schema = props.nodes[key as NodeType];
        if(isSchema(schema)) {
            ((config.nodes!!)[key as NodeType]!!).render = schema.render?.name;
        }
    }

    for(const key in props.tags) {
        const schema = props.tags[key];
        if(isSchema(schema)) {
            ((config.tags!!)[key]!!).render = schema.render?.name;
        }
    }

    return config;
}

export type IACFComponents = Record<string, AstroComponentFactory>;

export const ACFComponents = async (nodes: URL, tags: URL): Promise<string> => {
    let nodeImports: any = {}, tagImports: any = {};
    let namedNodeImports: string[] = [], namedTagImports: string[] = []
    if(fs.existsSync(nodes)) {
        /* @vite-ignore */
        nodeImports = await import(nodes.pathname);
    }

    if(fs.existsSync(tags)) {
        /* @vite-ignore */
        tagImports = await import(tags.pathname);
    }

    namedNodeImports = getNamedImport(nodeImports);
    namedTagImports = getNamedImport(tagImports);
    let src: string = "";

    if(namedNodeImports.length > 0) {
        src += `import * as Nodes from '${nodes.pathname}';
        `;
    }

    if(namedTagImports.length > 0) {
        src += `import * as Tags from '${tags.pathname}';
        `;
    }

    src += `
    export default {
    `;

    for(const key in namedNodeImports) {
        src += `[Nodes.${key}.render.name]: Nodes.${key}.render;
        `;
    }

    for(const key in namedTagImports) {
        src += `[Tags.${key}.render.name]: Tags.${key}.render;
        `;
    }

    src += `}`;
    
    return src;
}

export const isSchema = (prop: any): prop is Schema<Config, AstroComponentFactory> => {
    return typeof prop === 'object' &&
        prop !== null && 
        'render' in prop &&
        'isAstroComponentFactory' in prop['render']
}
