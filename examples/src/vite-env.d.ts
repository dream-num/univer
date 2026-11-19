/// <reference types="vite/client" />

declare module 'virtual:univer-examples-document-locale' {
    export const loadDocumentLocale: typeof import('./docs/locale-loader').loadDocumentLocale;
}

declare module 'virtual:univer-examples-sheet-locale' {
    export const loadSheetLocale: typeof import('./sheets/locale-loader').loadSheetLocale;
}
