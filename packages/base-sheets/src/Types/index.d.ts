/// <reference types="vite/client" />

export * from '../index';
declare module '@univerjs/base-sheets' {}

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
