/// <reference types="vite/client" />

export * from '../index';
declare module '@univer/base-formula-engine' {}

import JSX = preact.JSX;

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}
