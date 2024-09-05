// The type definition is copied from:
// examples/src/plugins/debugger/controllers/e2e/e2e-memory.controller.ts
export interface IE2EControllerAPI {
    loadAndRelease(id: number): Promise<void>;
    loadDefaultSheet(): Promise<void>;
    loadDefaultDoc(): Promise<void>;
    disposeUniver(): Promise<void>;
    disposeDefaultSheetUnit(unitId?: string): Promise<void>;
}

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        E2EControllerAPI: IE2EControllerAPI;
    }
}
