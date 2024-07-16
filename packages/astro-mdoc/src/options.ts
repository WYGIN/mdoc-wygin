import type { FSPath } from "./config";

export interface MarkdocIntegrationOptions {
	allowHTML?: boolean;
	ignoreIndentation?: boolean;
    mdocPath?: FSPath;
}
