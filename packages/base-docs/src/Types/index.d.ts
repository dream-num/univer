/// <reference types="vite/client" />

export * from '../index';
declare module '@univerjs/base-docs' {}

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
