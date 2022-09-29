import { DEFAULT_SELECTION } from '../../Const';
import { IGridRange } from '../../Interfaces';

export interface INamedRange {
    namedRangeId: string;
    name: string;
    range: IGridRange;
}

export const DEFAULT_NAMED_RANGE: INamedRange = {
    namedRangeId: 'named-range-01',
    name: 'namedRange01',
    range: {
        sheetId: 'sheet-01',
        rangeData: DEFAULT_SELECTION,
    },
};
