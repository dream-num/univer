import { IGridRange } from './IRangeData';

export interface INamedRange {
    namedRangeId: string;
    name: string;
    range: IGridRange;
}
