import { Observable } from '../Observer/Observable';
import { WorkSheet } from '../Sheets/Domain';

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

    onHideSheetObservable: Observable<{ sheet: WorkSheet }>;
    onShowSheetObservable: Observable<{ sheet: WorkSheet }>;

    onBeforeChangeActiveSheetObservable: Observable<{ sheet: WorkSheet }>;
    onAfterChangeActiveSheetObservable: Observable<{ sheet: WorkSheet }>;

    onBeforeChangeSheetNameObservable: Observable<void>;
    onAfterChangeSheetNameObservable: Observable<{ name: string; sheet: WorkSheet }>;

    onBeforeRemoveSheetObservable: Observable<{ index: number }>;
    onAfterRemoveSheetObservable: Observable<{ index: number; sheetId: string }>;
};
