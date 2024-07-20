import { type Config, type ConfigType } from "@markdoc/markdoc"
import type { AstroConfig, AstroIntegration } from "astro";
import type { MarkdocIntegrationOptions } from "./options";
import { defaultMdocPath, mdocPathDefault } from "./mdoc";
import { ConfigFromURL, mergeConfig } from "./config";
import { viteAstroMdocPlugin } from "./runtime";
import * as fs from 'node:fs';

export const SUPPORTED_MARKDOC_SRC_REGEX = /\.(md|mdoc|js|ts|jsx|tsx|mjs|mts|ejs|ets|markdoc.ts)$/;

export const SUPPORTED_MARKDOC_PARTIALS = /\.(md|mdoc)$/;

export async function loadMdocConfig(
    { root }: Pick<AstroConfig, 'root'>,
    options: MarkdocIntegrationOptions,
): Promise<Config> {
    let nodes: Config = {}, tags: Config = {}, variables: Config = {}, functions: Config = {}, partials: Config = {};
    const configPath = defaultMdocPath({ path: options?.configPath });
    const nodeURL = new URL(configPath.nodes as string, root);
    if(fs.existsSync(nodeURL)) {
        nodes = await ConfigFromURL(nodeURL, 'node');
    }

    const tagURL = new URL(configPath.tags as string, root);
    if(fs.existsSync(tagURL)) {
        tags = await ConfigFromURL(tagURL, 'tag');
    }

    const variableURL = new URL(configPath.variables as string, root);
    if(fs.existsSync(variableURL)) {
        variables = await ConfigFromURL(variableURL, 'variable');
    }

    const funcURL = new URL(configPath.functions as string, root)
    if(fs.existsSync(funcURL)) {
        functions = await ConfigFromURL(funcURL, 'function');
    }

    const partialURL = new URL(configPath.partials as string, root);
    if(fs.existsSync(partialURL)) {
        partials = await ConfigFromURL(partialURL, options);
    }

    return mergeConfigs(nodes, tags, variables, functions, partials);
}

const mergeConfigs = (
    nodes: Config, 
    tags: Config,
    variables: Config,
    functions: Config,
    partials: Config,
): Config => {
    let config = mergeConfig(nodes, tags);
    config = mergeConfig(config, variables);
    config = mergeConfig(config, functions);
    config = mergeConfig(config, partials);

    return config;
}

export default function AstroMdoc(options?: MarkdocIntegrationOptions): AstroIntegration {
    return AstroMdocSSR({ options })
}

const AstroMdocSSR = ({ options = {
    configPath: mdocPathDefault,
}}: { 
    options?: MarkdocIntegrationOptions
}): AstroIntegration => {
    return {
        name: 'astro-mdoc',
        hooks: {
            "astro:config:setup": async ({ config, updateConfig }) => {
                const mdocConfig = await Promise.resolve(viteAstroMdocPlugin(config, options));
                updateConfig({
                    vite: {
                        plugins: [mdocConfig]
                    }
                })
            },
        }
    } satisfies AstroIntegration;
}