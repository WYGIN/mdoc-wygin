import Accordion from "../../components/Accordion.astro";
import type { AstroMdocConfig } from "astro-mdoc/src/config";

export const AccordionItem = {
    heading: {
        render: Accordion as any,
        children: ['paragraph', 'tag', 'list'],
        attributes: {
            heading: {
                type: String,
            },
            content: {
                type: String,
            }
        }
    }
} satisfies AstroMdocConfig['nodes']