declare module 'virtual:wygin/astro-mdoc-config' {
    const Config: import('./config').AstroMarkdocConfig;
    export default Config;
}

declare module 'virtual:wygin/astro-mdoc-component-imports' {
    const Imports: Array<{[key: any]: import('astro/runtime/server/index.js').AstroComponentFactory }>;
    export * from Imports
}
