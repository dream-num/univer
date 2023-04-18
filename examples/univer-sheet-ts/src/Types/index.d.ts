/// <reference types="vite/client" />

declare module 'univer-sheet-ts' {}

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
