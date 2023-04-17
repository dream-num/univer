/// <reference types="vite/client" />

declare module 'univer-doc-ts' {}

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
