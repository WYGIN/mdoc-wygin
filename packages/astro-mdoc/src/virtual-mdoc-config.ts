import type { AstroConfig, ViteUserConfig } from 'astro';
import { acfMap } from './acf';
import type { AstroMarkdocConfig } from './config';
import type { MarkdocIntegrationOptions } from './options';
import { setupMdocConfig } from './runtime';

function resolveVirtualModuleId<T extends string>(id: T): `\0${T}` {
	return `\0${id}`;
}

/** Vite plugin that exposes Astro mdoc config and project context via virtual modules. */
export async function vitePluginAstroMdocConfig(config: AstroConfig, options: MarkdocIntegrationOptions | undefined): Promise<NonNullable<ViteUserConfig['plugins']>[number]> {
    let mdocConfig = await setupMdocConfig(config, [], options);
    let StringifiedAstroMdocComponentImports = '';
	[...acfMap].forEach(
        ([key, value]) => 
            StringifiedAstroMdocComponentImports += `export const ${key} = await import(${JSON.stringify(value) });\n`,
    )

    /** Map of virtual module names to their code contents as strings. */
	const modules = {
        'virtual:wygin/astro-mdoc-component-imports':  `${StringifiedAstroMdocComponentImports}`,
        'virtual:wygin/astro-mdoc-config': `export default ${JSON.stringify(mdocConfig)}`,
    } satisfies Record<string, string>;

    /** Mapping names prefixed with `\0` to their original form. */
	const resolutionMap = Object.fromEntries(
		(Object.keys(modules) as (keyof typeof modules)[]).map((key) => [
			resolveVirtualModuleId(key),
			key,
		])
	);

	return {
		name: 'vite-plugin-astro-mdoc-config',
		resolveId(id): string | void {
			if (id in modules) return resolveVirtualModuleId(id);
		},
		load(id): string | void {
			const resolution = resolutionMap[id];
			if (resolution) return modules[resolution];
		},
	};
}
