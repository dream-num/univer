/// <reference types="vite/client" />

export * from '../index';
declare module '@univer/sheets-plugin-clipboard-office' {}

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
