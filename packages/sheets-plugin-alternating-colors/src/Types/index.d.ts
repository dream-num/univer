

export * from '../index';
declare module '@univerjs/sheets-plugin-alternating-colors' { }

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
