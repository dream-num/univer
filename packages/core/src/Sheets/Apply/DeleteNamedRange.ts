import { INamedRange } from '../../Interfaces/INamedRange';

export function DeleteNamedRange(
    namedRanges: INamedRange[],
    namedRangeId: string
): INamedRange {
    return namedRanges.find((currentNamedRange: INamedRange, i) => {
        if (currentNamedRange.namedRangeId === namedRangeId) {
            // remove
            namedRanges.splice(i, 1);
            return currentNamedRange;
        }
        return null;
    })!;
}
