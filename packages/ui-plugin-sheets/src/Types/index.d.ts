/// <reference types="vite/client" />

export * from '../index';
declare module '@univerjs/ui-plugin-sheets' {}

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
