

export * from '../index';
declare module '@univer/sheets-plugin-alternating-colors' { }

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
