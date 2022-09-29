import { AlternatingColorsPlugin } from '../AlternatingColorsPlugin';
import { IBandedRange } from '../IBandedRange';

export function DeleteBanding(plugin: AlternatingColorsPlugin, bandedRangeId: string): IBandedRange {
    let data = plugin.getBandingData();
    const deleteBanding = data.find((bandedRange: IBandedRange, i) => {
        if (bandedRange.bandedRangeId === bandedRangeId) {
            // remove
            data.splice(i, 1);
            return bandedRange;
        }
        return null;
    })!;
    return deleteBanding;
}
