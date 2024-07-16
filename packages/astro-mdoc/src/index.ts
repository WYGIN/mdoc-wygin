import type { AstroIntegration } from "astro";
import { vitePluginAstroMdocConfig } from "./virtual-mdoc-config";
import type { MarkdocIntegrationOptions } from "./options";

export default function AstroMarkdocSSR(options: MarkdocIntegrationOptions): AstroIntegration {
    return AstroMarkdocSSRConfig(options)
}

const AstroMarkdocSSRConfig = (options: MarkdocIntegrationOptions): AstroIntegration => {
    return {
        'name': 'astro-mdoc',
        hooks: {
            'astro:config:setup': async ({ config, updateConfig }) => {
                let mdocPlugin = await vitePluginAstroMdocConfig(config, options);
                updateConfig({
                    vite: {
                        plugins: [mdocPlugin]
                    }
                })
            }
        }
    }
}
