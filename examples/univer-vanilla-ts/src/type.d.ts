// declare module '*.less';

// use css module
declare module '*.less' {
    const resource: { [key: string]: string };
    export = resource;
}

