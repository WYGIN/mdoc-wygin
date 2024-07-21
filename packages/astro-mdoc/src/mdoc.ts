/* FSPath should start with `/` */
export type FSPath = `${string}`;

/* PartialPath must point to a directory. i.e. must end with `/` */
export type PartialPath = `/${string}/`;

export const __MarkdocPathSymbol = Symbol.for('@wygininc/types:MarkdocPath');

export type MdocConfig = {
    nodes?: FSPath,
    tags?: FSPath,
    variables?: FSPath,
    functions?: FSPath,
    partials?: FSPath,
    validations?: FSPath,
}

export type MdocConfigPath = {
    // readonly [__MarkdocPathSymbol]: true,
    path?: FSPath | MdocConfig | undefined,
}

export const isMarkdocConfigPath = (path: any): path is MdocConfigPath => {
    return path === 'object' 
        && path !== null && 
        // __MarkdocPathSymbol in path && 
        !!(path.__MarkdocPathSymbol) && 
        path.__MarkdocPathSymbol === true
}

const isMdocConfig = (path: any): path is MdocConfig => {
    return 'nodes' in path ||
        'tags' in path ||
        'variables' in path ||
        'functions' in path ||
        'partials' in path ||
        'validations' in path
}

export const defaultMdocPath = ({ path = mdocPathDefault }: { path?: MdocConfigPath }): MdocConfig => {
    if(isMdocConfig(path.path)) {
        path.path.nodes ??= mdocConfigDefault.nodes;
        path.path.tags ??= mdocConfigDefault.tags;
        path.path.variables ??= mdocConfigDefault.variables;
        path.path.functions ??= mdocConfigDefault.functions;
        path.path.partials ??= mdocConfigDefault.partials;
        path.path.validations ??= mdocConfigDefault.validations;

        return path.path;
    }

    let mdocPath: MdocConfig = {};
    path.path ??= `src/markdoc`;
    mdocPath.nodes = mdocConfigFile('nodes', path.path);
    mdocPath.tags = mdocConfigFile('tags', path.path);
    mdocPath.variables = mdocConfigFile('variables', path.path);
    mdocPath.functions = mdocConfigFile('functions', path.path);
    mdocPath.partials = mdocConfigFile('partials', path.path);
    mdocPath.validations = mdocConfigFile('validations', path.path);

    return mdocPath
}

export const mdocConfigDefault: Required<MdocConfig> = {
    nodes: mdocConfigFile('nodes'),
    functions: mdocConfigFile('functions'),
    partials: `src/markdoc/partials/`,
    tags: mdocConfigFile('tags'),
    variables: mdocConfigFile('variables'),
    validations: mdocConfigFile('validations'),
}

export const mdocPathDefault: MdocConfigPath = {
    // [__MarkdocPathSymbol]: true,
    path: mdocConfigDefault
}

function mdocConfigFile(filename: string, prefix?: FSPath): FSPath {
    if(prefix) {
        return `${prefix}/${filename}/index.ts`;
    }

    return `src/markdoc/${filename}/index.ts`;
}
