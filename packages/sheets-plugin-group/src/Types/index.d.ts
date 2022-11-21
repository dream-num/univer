

export * from '../index';
declare module '@univer/sheets-plugin-group' { }

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
