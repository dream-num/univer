export function textTrim(x: string): string {
    if (x.length === 0) {
        // if (x == null || x.length == 0) {
        return x;
    }
    return x.replace(/^\s+|\s+$/gm, '');
}
