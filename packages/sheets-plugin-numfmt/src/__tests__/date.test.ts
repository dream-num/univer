import numfmt from '@univerjs/base-numfmt-engine';
import { describe, expect, it } from 'vitest';

describe('test numfmt date', () => {
    it('date parse date', () => {
        expect(numfmt.parseDate('asdasdasd')).toBe(null);
        expect(numfmt.parseDate('1988/12/12 21:21:21').z).toBe('yyyy/mm/dd hh:mm:ss');
        expect(numfmt.parseDate('12/12 21:21:21').z).toBe('mm/dd hh:mm:ss');
        expect(numfmt.parseDate('2012/12 21:21:21').z).toBe('yyyy/m hh:mm:ss'); // TODO: is yyy/mm hh:mm:ss ?
        expect(numfmt.parseDate('2012/12 21:21').z).toBe('yyyy/m hh:mm'); // TODO: is yyy/mm hh:mm ?
        expect(numfmt.parseDate('2012/12').z).toBe('yyyy/m'); // TODO: is yyy/mm ?
        expect(numfmt.parseDate('2012/12/12').z).toBe('yyyy/mm/dd');
        expect(numfmt.parseDate('21:21')).toBe(null);
    });
});
