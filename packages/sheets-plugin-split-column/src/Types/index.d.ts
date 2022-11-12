


export * from '../index';
declare module '@univer/sheets-plugin-split-column' { }

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
