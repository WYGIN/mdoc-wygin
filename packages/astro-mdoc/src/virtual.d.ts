declare module 'virtual:wygin/acf-components' {
    const Components: Array<{[key: any]: import('astro/runtime/server/index.js').AstroComponentFactory}>;
    export default Components;
}

declare module 'virtual:wygin/mdoc-config' {
    const Config: import('@markdoc/markdoc').Config;
    export default Config;
}

declare module 'virtual:wygin/options' {
    const Opts: import('./options').MarkdocIntegrationOptions;
    export default Opts;
}
