export * from '../index';
declare module '@univer/style-univer' { }


// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
