import { Direction, ICellData, Nullable } from '@univerjs/core';

export enum DATA_TYPE {
    NUMBER = 'number',
    DATE = 'date',
    EXTEND_NUMBER = 'extendNumber',
    CHN_NUMBER = 'chnNumber',
    CHN_WEEK2 = 'chnWeek2',
    CHN_WEEK3 = 'chnWeek3',
    LOOP_SERIES = 'loopSeries',
    FORMULA = 'formula',
    OTHER = 'other',
}

export type ICopyDataPiece = {
    [key: string]: ICopyDataInType[];
};

export interface ICopyDataInType {
    data: Array<Nullable<ICellData>>;
    index: ICopyDataInTypeIndexInfo;
}

export type ICopyDataInTypeIndexInfo = number[];

export interface IAutoFillRule {
    type: string;
    match: (cellData: Nullable<ICellData>) => boolean;
    isContinue: (prev: IRuleConfirmedData, cur: Nullable<ICellData>) => boolean;
    applyFunctions?: APPLY_FUNCTIONS;
    priority: number;
}

export interface IRuleConfirmedData {
    type?: string;
    cellData: Nullable<ICellData>;
}

export type APPLY_FUNCTIONS = {
    [key in APPLY_TYPE]?: (
        dataWithIndex: ICopyDataInType,
        len: number,
        direction: Direction
    ) => Array<Nullable<ICellData>>;
};

export enum APPLY_TYPE {
    COPY = '0',
    SERIES = '1',
    ONLY_FORMAT = '2',
    NO_FORMAT = '3',
}

export type APPLY_TYPE_IN_USE = Omit<APPLY_TYPE, APPLY_TYPE.NO_FORMAT>;
