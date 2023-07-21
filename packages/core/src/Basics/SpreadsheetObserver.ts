import { Observable } from '../Observer/Observable';
import { IWorksheet } from '../Types/Interfaces/IWorksheetData';

export type SpreadsheetObserver = {
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

    onHideSheetObservable: Observable<{ sheet: IWorksheet }>;
    onShowSheetObservable: Observable<{ sheet: IWorksheet }>;

    onBeforeChangeActiveSheetObservable: Observable<{ sheet: IWorksheet }>;
    onAfterChangeActiveSheetObservable: Observable<{ sheet: IWorksheet }>;

    onBeforeChangeSheetNameObservable: Observable<void>;
    onAfterChangeSheetNameObservable: Observable<{ name: string; sheet: IWorksheet }>;

    onBeforeRemoveSheetObservable: Observable<{ index: number }>;
    onAfterRemoveSheetObservable: Observable<{ index: number; sheetId: string }>;
};
