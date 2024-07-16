import type {
	Config,
	ConfigType as MarkdocConfig,
	MaybePromise,
	NodeType,
	Schema,
} from '@markdoc/markdoc';
import _Markdoc from '@markdoc/markdoc';
import type { AstroInstance } from 'astro';
import { componentConfigSymbol } from './utils';

export type Render = ComponentConfig | AstroInstance['default'] | string;
export type ComponentConfig = {
	type: 'package' | 'local';
	path: string;
	namedExport?: string;
	[componentConfigSymbol]: true;
};

export type AstroMarkdocConfig<C extends Record<string, any> = Record<string, any>> = Omit<
	MarkdocConfig,
	'tags' | 'nodes'
> &
	Partial<{
		tags: Record<string, Schema<Config, Render>>;
		nodes: Partial<Record<NodeType, Schema<Config, Render>>>;
		ctx: C;
		extends: MaybePromise<ResolvedAstroMarkdocConfig>[];
	}>;

export type ResolvedAstroMarkdocConfig = Omit<AstroMarkdocConfig, 'extends'>;

export const Markdoc = _Markdoc;

export function defineMarkdocConfig(config: AstroMarkdocConfig): AstroMarkdocConfig {
	return config;
}

export type FSPath = `/${string}`;

const __MarkdocPathSymbol = Symbol.for('@wygininc/types:MarkdocPath');

export type MarkdocPath = MarkdocPathObj | FSPath;

export type MarkdocPathObj = {
    readonly [__MarkdocPathSymbol]: true,
    base?: FSPath,
    nodes?: FSPath,
    tags?: FSPath,
    variables?: FSPath,
    functions?: FSPath,
    partials?: FSPath,
}

export const getMarkdocPath = (path?: MarkdocPath): MarkdocPathObj => {
    let nodes, tags, variables, functions, partials: string;
    if(path && isMarkdocPathObj(path)) {
        if(path.base) {
            nodes = `${path.base}${path.nodes}/index.ts` as FSPath;
            tags = `${path.base}${path.tags}/index.ts` as FSPath;
            variables = `${path.base}${path.variables}/index.ts` as FSPath;
            functions = `${path.base}${path.functions}/index.ts` as FSPath;
            partials = `${path.base}${path.partials}/`;
            return { 
                nodes, 
                tags, 
                variables, 
                functions, 
                partials: partials as FSPath, 
                [__MarkdocPathSymbol]: true, 
            }
        }
        return { 
            nodes: `/src/markdoc${path.nodes ?? 'nodes'}/index.ts`, 
            tags: `/src/markdoc${path.tags ?? 'tags'}/index.ts`, 
            variables: `/src/markdoc${path.variables ?? 'variables'}/index.ts`, 
            functions: `/src/markdoc${path.functions ?? 'functions'}/index.ts`, 
            partials: `/src/markdoc${path.partials ?? 'partials'}/`,
            [__MarkdocPathSymbol]: true,
        }
    } else if(path && !isMarkdocPathObj(path))
        return { 
            nodes: `${path}/nodes/index.ts` , 
            tags: `${path}/tags/index.ts`, 
            variables: `${path}/variables/index.ts`, 
            functions: `${path}/functions/index.ts`, 
            partials: `${path}/partials/`,
            [__MarkdocPathSymbol]: true,
        }
    else return { 
        nodes: `/src/markdoc/nodes/index.ts`, 
        tags: `/src/markdoc/tags/index.ts`, 
        variables: `/src/markdoc/variables/index.ts`, 
        functions: `/src/markdoc/functions/index.ts`, 
        partials: `/src/markdoc/partials/`, 
        [__MarkdocPathSymbol]: true,
    }
}

export const isMarkdocPathObj = (path: any): path is MarkdocPathObj => {
    return path === 'object' 
        && path !== null 
        && __MarkdocPathSymbol in path 
        && !!(path.__MarkdocPathSymbol) 
        && path.__MarkdocPathSymbol === true
}
