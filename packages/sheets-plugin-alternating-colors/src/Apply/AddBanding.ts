import { AlternatingColorsPlugin } from '../AlternatingColorsPlugin';
import { IBandedRange } from '../IBandedRange';

export function AddBanding(plugin: AlternatingColorsPlugin, bandedRange: IBandedRange): void {
    let data = plugin.getBandingData();
    data.push(bandedRange);
}
