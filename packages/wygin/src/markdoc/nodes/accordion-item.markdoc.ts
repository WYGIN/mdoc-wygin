import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import Accordion from "../../components/Accordion.astro";
import type { Config, Schema } from "@markdoc/markdoc";

export const AccordionItem = {
    render: Accordion,
    children: ['paragraph', 'tag', 'list'],
    attributes: {
        heading: {
            type: String,
        },
        content: {
            type: String,
        }
    }
} satisfies Schema<Config, AstroComponentFactory>;