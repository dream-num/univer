/// <reference types="vite/client" />

import JSX = preact.JSX;

export * from '../index';
declare module '@univer/sheets-plugin-frozen' {}

declare module 'es6-proxy-polyfill';
// declare module '*.less';

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
