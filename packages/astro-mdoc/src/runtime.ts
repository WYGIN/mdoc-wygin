import type { AstroInstance, AstroConfig } from "astro";
import { createComponent, renderComponent } from "astro/compiler-runtime";
import type { MarkdocIntegrationOptions } from './options';
import { type AstroMarkdocConfig, type FSPath } from './config';
import { markdocUserConfig } from "./nodes";
import { htmlTag } from './html/tagdefs/html.tag.js';
import defaultMdocConfig from 'virtual:wygin/astro-mdoc-config';

export async function setupMdocConfig(config: AstroConfig, props: Record<string, any>, options: MarkdocIntegrationOptions | undefined): Promise<MergedConfig> {
    let mdocConfig = await Promise.resolve(markdocUserConfig(config, options?.mdocPath))
    let mergedConfig = mergeConfig(
        mdocConfig, { variables: props },
    )

    if(options?.allowHTML) 
        return mergeConfig(mergedConfig, HTML_CONFIG)

    return mergedConfig
}

export function createContentComponent(
	Renderer: AstroInstance['default'],
	stringifiedAst: string,
	config: AstroConfig,
	options: MarkdocIntegrationOptions | undefined,
) {
	return createComponent({
		async factory(result: any, props: Record<string, any>) {
            let mdocConfig = mergeConfig(defaultMdocConfig, { variables: props })

			return renderComponent(
                result, 
                Renderer.name, 
                Renderer, 
                { stringifiedAst,  mdocConfig }, 
                {},
            );
		},
		propagation: 'self',
	} as any);
}

type MergedConfig = Required<Omit<AstroMarkdocConfig, 'extends'>>;

/** Merge function from `@markdoc/markdoc` internals */
export function mergeConfig(
	configA: AstroMarkdocConfig,
	configB: AstroMarkdocConfig
): MergedConfig {
	return {
		...configA,
		...configB,
		ctx: {
			...configA.ctx,
			...configB.ctx,
		},
		tags: {
			...configA.tags,
			...configB.tags,
		},
		nodes: {
			...configA.nodes,
			...configB.nodes,
		},
		functions: {
			...configA.functions,
			...configB.functions,
		},
		variables: {
			...configA.variables,
			...configB.variables,
		},
		partials: {
			...configA.partials,
			...configB.partials,
		},
		validation: {
			...configA.validation,
			...configB.validation,
		},
	};
}

// statically define a partial MarkdocConfig which registers the required "html-tag" Markdoc tag when the "allowHTML" feature is enabled
const HTML_CONFIG: AstroMarkdocConfig = {
	tags: {
		'html-tag': htmlTag,
	},
};
