/// <reference types="vite/client" />

export * from '../index';
declare module 'univer-slide-ts' {}

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
