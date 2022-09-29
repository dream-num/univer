import { INamedRange } from '../INamedRange';

export function DeleteNamedRangeService(
    namedRanges: INamedRange[],
    namedRangeId: string
): INamedRange {
    return namedRanges.find((currentNamedRange: INamedRange, i) => {
        if (currentNamedRange.namedRangeId === namedRangeId) {
            // remove
            namedRanges.splice(i, 1);
            return currentNamedRange;
        }
    })!;
}
