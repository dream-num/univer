export * from '../index';
declare module '@univerjs/style-univer' {}

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
