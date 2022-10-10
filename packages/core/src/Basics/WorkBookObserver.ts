import { Observable } from '../Observer/Observable';
import { Worksheet1 } from '../Sheets/Domain';

export type WorkBookObserver = {
    onBeforeInsertSheetObservable: Observable<{ index: number; sheetId: string }>;
    onAfterInsertSheetObservable: Observable<{ index: number; sheetId: string }>;

    onAfterSetSelectionObservable: Observable<void>;
    onAfterChangeUILocaleObservable: Observable<void>;

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

    onHideSheetObservable: Observable<{ sheet: Worksheet1 }>;
    onShowSheetObservable: Observable<{ sheet: Worksheet1 }>;

    onBeforeChangeActiveSheetObservable: Observable<{ sheet: Worksheet1 }>;
    onAfterChangeActiveSheetObservable: Observable<{ sheet: Worksheet1 }>;

    onBeforeChangeSheetNameObservable: Observable<void>;
    onAfterChangeSheetNameObservable: Observable<{ name: string; sheet: Worksheet1 }>;

    onBeforeRemoveSheetObservable: Observable<{ index: number }>;
    onAfterRemoveSheetObservable: Observable<{ index: number; sheetId: string }>;
};
