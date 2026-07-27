declare module '@univerjs/docs-ui/commands/commands/__tests__/create-command-test-bed' {
    import type { Dependency, DocumentDataModel, IDocumentData, Injector, Univer } from '@univerjs/core';

    export function createCommandTestBed(docData?: IDocumentData, dependencies?: Dependency[]): {
        univer: Univer;
        get: Injector['get'];
        doc: DocumentDataModel;
        injector: Injector;
    };
}
