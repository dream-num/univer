import { Merges } from '../Domain/Merges';
import { IRangeData } from '../../Interfaces';

/**
 *
 * @param merges
 * @param rectangles
 * @returns
 *
 * @internal
 */
export function RemoveMerge(merges: Merges, rectangles: IRangeData[]): IRangeData[] {
    let remove: IRangeData[] = [];
    for (let i = 0; i < rectangles.length; i++) {
        remove = remove.concat(merges.remove(rectangles[i]));
    }
    return remove;
}
