import Accordion from "../../components/Accordion.astro";
// import type { AstroMdocConfig } from "astro-mdoc/src/config";

export const AccordionI = (
    {
        heading: {
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
        }
    }
)