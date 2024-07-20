import type { AstroConfig, ViteUserConfig } from "astro";
import type { MarkdocIntegrationOptions } from "./options";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ACFComponents } from "./buildtime";
import { defaultMdocPath } from "./mdoc";

function resolveVirtualModuleId<T extends string>(id: T): `\0${T}` {
	return `\0${id}`;
}

export async function viteAstroMdocPlugin({ root }: Pick<AstroConfig, 'root'>, options?: MarkdocIntegrationOptions): Promise<NonNullable<ViteUserConfig['plugins']>[number]> {
    const resolveId = (id: string) => JSON.stringify(id.startsWith('.') ? resolve(fileURLToPath(root), id) : id);
    const defaultAstroMdocConfigPath = defaultMdocPath({ path: options?.configPath })
    const acfComponents = await ACFComponents(
        new URL(defaultAstroMdocConfigPath.nodes as string, root),
        new URL(defaultAstroMdocConfigPath.tags as string, root),
    )
    const modules = {
        'virtual:wygin/acf-components': acfComponents,
        'virtual:wygin/mdoc-config': `import { loadMdocConfig } from 'astro-mdoc';
        const config = await loadMdocConfig({ root: new URL(${JSON.stringify(root)}) }, ${JSON.stringify(options!!)});
        console.log(config);
        export default config;
        `,
        'virtual:wygin/options': `export default ${JSON.stringify(options)}`
    } satisfies Record<string, string>;

    /** Mapping names prefixed with `\0` to their original form. */
	const resolutionMap = Object.fromEntries(
		(Object.keys(modules) as (keyof typeof modules)[]).map((key) => [
			resolveVirtualModuleId(key),
			key,
		])
	);

    return {
        name: 'astro-mdoc',
		resolveId(id): string | void {
			if (id in modules) return resolveVirtualModuleId(id);
		},
		load(id): string | void {
			const resolution = resolutionMap[id];
			if (resolution) return modules[resolution];
		},
    }
}