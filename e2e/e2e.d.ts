// The type definition is copied from:
// packages-experimental/debugger/src/controllers/e2e/e2e.controller.ts
export interface IE2EControllerAPI {
    loadAndRelease(id: number, loadTimeout?: number, disposeTimeout?: number): Promise<void>;
    loadDefaultSheet(loadTimeout?: number): Promise<void>;
    loadDefaultDoc(loadTimeout?: number): Promise<void>;
    loadDemoSheet(loadTimeout?: number): Promise<void>;
    loadMergeCellSheet(loadTimeout?: number): Promise<void>;
    loadDefaultStyleSheet(loadTimeout?: number): Promise<void>;
    setDarkMode(darkMode: boolean): void;
    disposeUniver(): Promise<void>;
    disposeCurrSheetUnit(disposeTimeout?: number): Promise<void>;
}

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        E2EControllerAPI: IE2EControllerAPI;
        univer: any;
        // eslint-disable-next-line ts/no-explicit-any
        univerAPI: any;
    }
}
