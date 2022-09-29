import { Tools } from '@univer/core';
import { AlternatingColorsPlugin } from '../AlternatingColorsPlugin';
import { DEFAULT_PROPERTIES_BANDED_RANGE, IBandedRange } from '../IBandedRange';

export function SetBanding(plugin: AlternatingColorsPlugin, bandedRange: IBandedRange): IBandedRange {
    let data = plugin.getBandingData();
    let result: IBandedRange = DEFAULT_PROPERTIES_BANDED_RANGE;
    for (let i = 0; i < data.length; i++) {
        const banding = data[i];
        if (banding.bandedRangeId === bandedRange.bandedRangeId) {
            result = Tools.deepClone(banding);
            // edit
            data[i] = bandedRange;
        }
    }

    return result;
}
