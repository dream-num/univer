/// <reference types="vite/client" />

export * from '../index';
declare module '@univer/sheets-plugin-sort' {}

// import JSX = preact.JSX;

declare module 'es6-proxy-polyfill';
// declare module '*.less';

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
