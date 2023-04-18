/// <reference types="vite/client" />

declare module 'univer-vanilla-ts' {}

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
