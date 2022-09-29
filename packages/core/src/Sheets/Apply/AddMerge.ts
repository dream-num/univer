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
export function addMerge(merges: Merges, rectangles: IRangeData[]): IRangeData[] {
    let remove: IRangeData[] = [];
    for (let i = 0; i < rectangles.length; i++) {
        merges.add(rectangles[i]);
        // remove = remove.concat(merges.add(rectangles[i]));
    }
    return remove;
}
