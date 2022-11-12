export * from '../index';
declare module '@univer/style-universheet' { }


// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
