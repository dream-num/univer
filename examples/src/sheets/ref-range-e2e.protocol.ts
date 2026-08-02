export const REF_RANGE_E2E_EVENT = 'univer-ref-range-feature-e2e-request';
export const REF_RANGE_E2E_READY_ATTRIBUTE = 'data-univer-ref-range-feature-e2e-ready';

export type FixtureAxis = 'row' | 'column';
export type FixtureOperation = 'insert' | 'delete';

export interface IRangeRecord {
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
}

export interface IPointRecord {
    row: number;
    column: number;
}

export interface IRectRecord {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface IFixtureSnapshot {
    merge: IRangeRecord;
    protection: IRangeRecord;
    filter: IRangeRecord;
    dataValidation: IRangeRecord;
    conditionalFormatting: IRangeRecord;
    hyperlink: IPointRecord;
    note: IPointRecord;
    comment: IPointRecord;
    dataValidationFormula: string | undefined;
    conditionalFormattingRule: string;
    hyperlinkUrl: string;
    popupRect: IRectRecord;
}

export type RefRangeE2ERequest =
    | { action: 'setup' }
    | { action: 'snapshot' }
    | { action: 'apply'; axis: FixtureAxis; operation: FixtureOperation; index: number }
    | { action: 'undo' };

export interface IRefRangeE2ERequestDetail {
    request: RefRangeE2ERequest;
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
}
