function QuickSwap<T>(array: T[], i: number, j: number): void {
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
}

function QuickCompare<T>(a: T, b: T): number {
    return a < b ? -1 : a > b ? 1 : 0;
}

function QuickStep<T>(
    array: T[],
    k: number,
    left: number,
    right: number,
    compare: Compare<T>
): void {
    while (right > left) {
        if (right - left > 600) {
            const n = right - left + 1;
            const m = k - left + 1;
            const z = Math.log(n);
            const s = 0.5 * Math.exp((2 * z) / 3);
            const sd =
                0.5 * Math.sqrt((z * s * (n - s)) / n) * (m - n / 2 < 0 ? -1 : 1);
            const newLeft = Math.max(left, Math.floor(k - (m * s) / n + sd));
            const newRight = Math.min(right, Math.floor(k + ((n - m) * s) / n + sd));
            QuickStep(array, k, newLeft, newRight, compare);
        }

        const t = array[k];
        let i = left;
        let j = right;

        QuickSwap(array, left, k);
        if (compare(array[right], t) > 0) {
            QuickSwap(array, left, right);
        }

        while (i < j) {
            QuickSwap(array, i, j);
            i++;
            j--;
            while (compare(array[i], t) < 0) {
                i++;
            }
            while (compare(array[j], t) > 0) {
                j--;
            }
        }

        if (compare(array[left], t) === 0) {
            QuickSwap(array, left, j);
        } else {
            j++;
            QuickSwap(array, j, right);
        }

        if (j <= k) {
            left = j + 1;
        }
        if (k <= j) {
            right = j - 1;
        }
    }
}

export type Compare<T> = (a: T, b: T) => number;

export function QuickSelect<T>(
    array: T[],
    k: number,
    left: number,
    right: number,
    compare: Compare<T>
) {
    QuickStep(
        array,
        k,
        left || 0,
        right || array.length - 1,
        compare || QuickCompare
    );
}
