export function clamp(number: number): number {
    if (number === 0) {
        return number;
    }
    const d = Math.ceil(Math.log10(number < 0 ? -number : number));
    const mag = 10 ** (16 - Math.floor(d));
    return Math.round(number * mag) / mag;
}
