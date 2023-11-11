import numfmt from '@univerjs/base-numfmt-engine';

/**
 * the function decimal just use positive,negative configuration ignored
 */
export const getDecimalFromPattern = (pattern: string, defaultValue: number = 0) => {
    if (!pattern) {
        return defaultValue;
    }

    const info = numfmt.getInfo(pattern);
    return info.maxDecimals ?? defaultValue;
};

/**
 * Determines whether two pattern are equal, excluding differences in decimal places
 */
export const isPatternEqualWithoutDecimal = (patternA: string, patternB: string) => {
    if ((patternA && !patternB) || (!patternA && patternB)) {
        return false;
    }
    const getString = (tokens: unknown[]) =>
        (tokens as Array<{ type: string; num?: string; value?: string }>).reduce(
            (pre, cur) => {
                if (pre.isEnd) {
                    return pre;
                }
                const str = (cur as any).value || (cur as any).num;
                if (cur.type === 'point') {
                    pre.isEnd = true;
                    return pre;
                }
                return { ...pre, result: pre.result + str };
            },
            { isEnd: false, result: '' }
        ).result;
    const partitionsA = numfmt.getInfo(patternA)._partitions;
    const partitionsB = numfmt.getInfo(patternB)._partitions;
    const A1 = getString(partitionsA[0].tokens);
    const B1 = getString(partitionsB[0].tokens);
    const A2 = getString(partitionsA[1].tokens);
    const B2 = getString(partitionsB[1].tokens);
    return A1 === B1 && A2 === B2 && partitionsA[1].color === partitionsB[1].color;
};

export const getDecimalString = (length: number) =>
    new Array(Math.min(Math.max(0, Number(length)), 30)).fill(0).join('');

export const setPatternDecimal = (pattern: string, decimalLength: number) => {
    if (/\.0?/.test(pattern)) {
        return pattern.replace(
            /\.0*/g,
            `${decimalLength > 0 ? '.' : ''}${getDecimalString(Number(decimalLength || 0))}`
        );
    }
    return pattern;
};

export const isPatternHasDecimal = (pattern: string) => /\.0?/.test(pattern);
