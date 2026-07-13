// The type definition is copied from:
// common/debugger/src/controllers/e2e/e2e.controller.ts
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
        floatDomContentBoxFixture?: {
            id: string;
            setContentBox: (contentBox: { wrapperInset?: number; contentInset?: number }) => void;
            setBorder: (border: boolean) => void;
            enableRotateHandle: () => void;
            getTransformerGeometry: () => {
                drawing: { left: number; top: number; width: number; height: number; angle: number };
                controls: Array<{ key: string; left: number; top: number; width: number; height: number; angle: number }>;
            };
            getLayout: () => {
                startX: number;
                startY: number;
                endX: number;
                endY: number;
                width: number;
                height: number;
                rotate: number;
            } | undefined;
        };
    }
}
