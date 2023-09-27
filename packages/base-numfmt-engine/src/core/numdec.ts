import { round } from './round';

const zero = {
    total: 1,
    sign: 0,
    period: 0,
    int: 1,
    frac: 0,
};

// returns the count of digits (including - and .) need to represent the number
export function numdec(value: number, incl_sign = true) {
    const v = Math.abs(value);

    // shortcut zero
    if (!v) {
        return zero;
    }

    const signSize = incl_sign && value < 0 ? 1 : 0;
    const intPart = Math.floor(v);
    const intSize = Math.floor(Math.log10(v) + 1);
    let periodSize = 0;
    let fracSize = 0;

    // is not an integer
    if (intPart !== v) {
        periodSize = 1;

        // B: this has turned out to be much faster than all pure math
        // based solutions I was able to come up with ¯\_(ツ)_/¯
        const n = String(round(intSize < 0 ? v * 10 ** -intSize : v / 10 ** intSize, 15));
        let f = n.length;
        let z = true;
        let i = 0;
        while (i <= n.length) {
            if (n[i] === '.') {
                // discount period
                f--;
                break;
            } else if (n[i] === '0' && z) {
                // leading zeros before period are discounted
                f--;
            } else {
                // non-zero digit
                z = false;
            }
            i++;
        }
        fracSize = f - intSize;

        if (fracSize < 0) {
            // the number is not representable [by Excel]
            // this would be something like 1000.0000000000001
            // it would normally get truncated to 15 significant figures and
            // end up in the same place as the following does:
            fracSize = 0;
            periodSize = 0;
        }
    }

    return {
        total: signSize + Math.max(intSize, 1) + periodSize + fracSize,
        digits: Math.max(intSize, 0) + fracSize,
        sign: signSize,
        period: periodSize,
        int: Math.max(intSize, 1),
        frac: fracSize,
    };
}
