import { defaultLocale, getLocale } from './locale';
import { OptionsData } from './options';
import { parsePart, PartType } from './parse-part';
import { runPart } from './run-part';

const default_text = parsePart('@');
const default_color = 'black';

function getPart(value: number, parts: PartType[]): PartType | undefined {
    for (let pi = 0; pi < 3; pi++) {
        const part = parts[pi];
        if (part) {
            let cond;
            if (part.condition) {
                const operator = part.condition[0];
                const operand = part.condition[1];
                if (operator === '=') {
                    cond = value === operand;
                } else if (operator === '>') {
                    cond = value > operand;
                } else if (operator === '<') {
                    cond = value < operand;
                } else if (operator === '>=') {
                    cond = value >= operand;
                } else if (operator === '<=') {
                    cond = value <= operand;
                } else if (operator === '<>') {
                    cond = value !== operand;
                }
            } else {
                cond = true;
            }
            if (cond) {
                return part;
            }
        }
    }
}

/**
 * 颜色类型
 * @param value
 * @param parts
 */
export function color(value: number, parts: PartType[]): string {
    if (typeof value !== 'number' || !isFinite(value)) {
        const nan_color = parts[3] ? parts[3].color : default_text.color;
        return nan_color || default_color;
    }
    const part = getPart(value, parts);
    return part ? part.color || default_color : default_color;
}

/**
 * 数字格式化
 * @param value
 * @param parts
 * @param opts
 */
export function formatNumber(value: string | number, parts: PartType[], opts: OptionsData): string {
    const l10n = getLocale(opts.locale as any);
    // not a number?
    const text_part = parts[3] ? parts[3] : default_text;
    if (typeof value === 'boolean') {
        value = value ? 'TRUE' : 'FALSE';
    }
    if (value == null) {
        return '';
    }
    // FIXME Both runPart and isFinite require Number type
    if (typeof value === 'number') {
        return runPart(value, text_part, opts, l10n);
    }
    // guard against non-finite numbers:
    if (!isFinite(Number(value))) {
        const loc: any = l10n || defaultLocale;
        if (isNaN(Number(value))) {
            return loc.nan;
        }
        return (Number(value) < 0 ? loc.negative : '') + loc.infinity;
    }
    // find and run the pattern part that applies to this number
    const part = getPart(Number(value), parts);
    return part ? runPart(Number(value), part, opts, l10n) : '';
}

/**
 * 日期检查
 * @param partitions
 */
export function isDate(partitions: PartType[]): boolean {
    return !!(
        (partitions[0] && partitions[0].date) ||
        (partitions[1] && partitions[1].date) ||
        (partitions[2] && partitions[2].date) ||
        (partitions[3] && partitions[3].date)
    );
}

/**
 * 文本检查
 * @param partitions
 */
export function isText(partitions: PartType[]): boolean {
    const [part1, part2, part3, part4] = partitions;
    return !!(
        (!part1 || part1.generated) &&
        (!part2 || part2.generated) &&
        (!part3 || part3.generated) &&
        part4 &&
        part4.text &&
        !part4.generated
    );
}

/**
 *
 * @param partitions
 */
export function isPercent(partitions: PartType[]): boolean {
    return !!(
        (partitions[0] && partitions[0].percent) ||
        (partitions[1] && partitions[1].percent) ||
        (partitions[2] && partitions[2].percent) ||
        (partitions[3] && partitions[3].percent)
    );
}
