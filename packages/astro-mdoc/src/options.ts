import type { MdocConfigPath } from "./mdoc";

export interface MarkdocIntegrationOptions {
	allowHTML?: boolean;
	ignoreIndentation?: boolean;
	typographer?: boolean;
    configPath?: MdocConfigPath;
}
