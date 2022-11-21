const PRECISION: number = 1e-10;

export function dec2frac(val: number, maxdigits_num: number, maxdigits_de: number): number[] {
    const sign: number = val < 0 ? -1 : 1;
    const maxdigits_n: number = 10 ** (maxdigits_num || 2);
    const maxdigits_d: number = 10 ** (maxdigits_de || 2);

    let z: number = Math.abs(val);
    let last_d: number = 0;
    let last_n: number = 0;
    let curr_n: number = 0;
    let curr_d: number = 1;
    let tmp: number;
    let r: number[];

    val = z;
    if (val % 1 === 0) {
        // handles exact integers including 0
        r = [val * sign, 1];
    } else if (val < 1e-19) {
        r = [sign, 1e19];
    } else if (val > 1e19) {
        r = [1e19 * sign, 1];
    } else {
        do {
            z = 1 / (z - Math.floor(z));
            tmp = curr_d;
            curr_d = curr_d * Math.floor(z) + last_d;
            last_d = tmp;
            last_n = curr_n;
            // round
            curr_n = Math.floor(val * curr_d + 0.5);
            if (curr_n >= maxdigits_n || curr_d >= maxdigits_d) {
                return [sign * last_n, last_d];
            }
        } while (Math.abs(val - curr_n / curr_d) >= PRECISION && z !== Math.floor(z));
        r = [sign * curr_n, curr_d];
    }
    return r;
}
