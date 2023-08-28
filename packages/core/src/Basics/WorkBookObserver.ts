import { Observable } from '../Observer/Observable';
import { Worksheet } from '../Sheets/Domain';

export type WorkBookObserver = {
    onBeforeInsertSheetObservable: Observable<{ index: number; sheetId: string }>;
    onAfterInsertSheetObservable: Observable<{ index: number; sheetId: string }>;

    onAfterSetSelectionObservable: Observable<void>;

    onBeforeChangeNameObservable: Observable<void>;
    onAfterChangeNameObservable: Observable<void>;

    onSheetTabColorChangeObservable: Observable<void>;

    onSheetOrderObservable: Observable<void>;

    onBeforeChangeSheetColorObservable: Observable<void>;
    onAfterChangeSheetColorObservable: Observable<void>;

    onBeforeChangeSheetDataObservable: Observable<void>;
    onAfterChangeSheetDataObservable: Observable<void>;

    onSheetRenderDidMountObservable: Observable<void>;

    onZoomRatioSheetObservable: Observable<{ zoomRatio: number }>;

    onHideSheetObservable: Observable<{ sheet: Worksheet }>;
    onShowSheetObservable: Observable<{ sheet: Worksheet }>;

    onBeforeChangeActiveSheetObservable: Observable<{ sheet: Worksheet }>;
    onAfterChangeActiveSheetObservable: Observable<{ sheet: Worksheet }>;

    onBeforeChangeSheetNameObservable: Observable<void>;
    onAfterChangeSheetNameObservable: Observable<{ name: string; sheet: Worksheet }>;
};
