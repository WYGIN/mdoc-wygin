import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { NodeType, Schema, Config, ConfigFunction, ValidationError, Node } from "@markdoc/markdoc";
import Markdoc from '@markdoc/markdoc';
import Func from "@markdoc/markdoc/src/ast/function";
import { getNamedImport } from "./imports";
import { MdocConfig } from "./buildtime";
import * as fs from 'node:fs';
import { SUPPORTED_MARKDOC_PARTIALS } from ".";
import type { MarkdocIntegrationOptions } from "./options";

export interface IMarkdocConfig {}

export interface IMarkdocNodeConfig extends IMarkdocConfig {
    node(): Config['nodes'];
    component(): AstroComponentFactory;
}

export interface IMarkdocTagConfig extends IMarkdocConfig {
    tag(tag: AstroMdocConfig['tags']): Config['tags'];
    component(node: AstroMdocConfig['tags']): AstroComponentFactory;
}

export interface IMarkdocVariableConfig extends IMarkdocConfig {
    variable(variable: AstroMdocConfig['variables']): Config['variables'];
}

export interface IMarkdocFuncConfig extends IMarkdocConfig {
    function(func: AstroMdocConfig['functions']): Config['functions'];
}

export interface IMarkdocPartialConfig extends IMarkdocConfig {
    partial(partial: AstroMdocConfig['partials']): Config['partials'];
    parse(partial: AstroMdocConfig['partials']): Node;
}

export interface IMarkdocValidationConfig extends IMarkdocConfig{
    validation(validation: AstroMdocConfig['validation']): Config['validation'];
}

type AstroMdocConfigFunction = ConfigFunction & {
    transform?(parameters: Record<string, any>, config: AstroMdocConfig): any;
    validate?(fn: Func, config: AstroMdocConfig): ValidationError[];
}

export type AstroMdocConfig = Config & {
    nodes?: Partial<Record<NodeType, Schema<Config, AstroComponentFactory>>>;
    tags?: Record<string, Schema<Config, AstroComponentFactory>>;
    functions?: Record<string, AstroMdocConfigFunction>;
    partials?: Record<string, URL>;
}

export type ConfigType = 'node' |
    'tag' |
    'function' |
    /* partials */
    MarkdocIntegrationOptions |
    'variable';

export const ConfigFromURL = async (url: URL, configType: ConfigType): Promise<Config> => {
    let config: Config = {};
    switch(configType) {
        case 'node':
            /* @vite-ignore */
            const nodeImports = await import(url.pathname);
            const namedNodeImports = getNamedImport(nodeImports);
            for(const key of namedNodeImports) {
                Object.assign(config, MdocConfig({
                    nodes: {
                        ...nodeImports[key],
                    }
                } satisfies AstroMdocConfig));
            }
            break;
        case 'tag':
            /* @vite-ignore */
            const tagImports = await import(url.pathname);
            const namedTagImports = getNamedImport(tagImports);
            for(const key of namedTagImports) {
                Object.assign(config, MdocConfig({
                    tags: {
                        ...tagImports[key],
                    }
                } satisfies AstroMdocConfig))
            }
        case 'function':
            /* @vite-ignore */
            const funcImports = await import(url.pathname);
            const namedFuncImports = getNamedImport(funcImports);
            for(const key of namedFuncImports) {
                Object.assign(config, {
                    functions: {
                        ...funcImports[key],
                    },
                } satisfies Config)
            }
        case 'variable':
            /* @vite-ignore */
            const varImports = await import(url.pathname);
            const namedVarImports = getNamedImport(varImports);
            for(const key of namedVarImports) {
                Object.assign(config, {
                    variables: {
                        ...varImports[key],
                    }
                } satisfies Config)
            }
        default:
            const partials = getFilesWithExtentions(url, SUPPORTED_MARKDOC_PARTIALS);
            const options = configType as MarkdocIntegrationOptions;
            const tokenizer = new Markdoc.Tokenizer({
                allowIndentation: !options.ignoreIndentation,
                typographer: options.typographer,
            });
            await Promise.all(partials.map(async partial => {
                const partialFileName = partial.pathname.split("/");
                const content = await fs.promises.readFile(partial, 'utf8');
                const tokens = tokenizer.tokenize(content);
                const node = Markdoc.parse(tokens);

                Object.assign(config, {
                    partials: {
                        [partialFileName[partialFileName.length - 1]]: node,
                    }
                } satisfies Config)
            }));
    }

    return config;
}

export const mergeConfig = (configA: Config, configB: Config): Config => {
    return {
        nodes: {
            ...configA.nodes,
            ...configB.nodes,
        },
        tags: {
            ...configA.tags,
            ...configB.tags,
        },
        functions: {
            ...configA.functions,
            ...configB.functions,
        },
        partials: {
            ...configA.partials,
            ...configB.partials,
        },
        variables: {
            ...configA.variables,
            ...configB.variables,
        },
        validation: {
            ...configA.validation,
            ...configB.validation,
        }
    } satisfies Config;
}

const getFilesWithExtentions = (dir: URL, extentions: RegExp) => {
    let markdocFiles: Array<URL> = [];
    if(fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for(const file of files) {
            const filepath = new URL(file, dir);
            if(fs.statSync(filepath).isDirectory()) {
                markdocFiles = markdocFiles.concat(getFilesWithExtentions(filepath, extentions));
            } else {
                if(extentions.test(filepath.href)) {
                    markdocFiles.push(filepath);
                }
            }
        }
    }
    return markdocFiles;
}
