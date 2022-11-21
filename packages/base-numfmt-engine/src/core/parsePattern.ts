import { resolveLocale } from './locale';
import { parsePart, PartType } from './parsePart';

export interface PatternType {
    pattern?: string;
    locale?: string;
    error?: string;
    partitions?: PartType[];
}

export function parsePattern(pattern: string): PatternType {
    const partitions = [];
    let conditional = false;
    let l10n_override;
    let text_partition = null;

    let p = pattern;
    let more = 0;
    let part = null;
    let i = 0;
    let conditions = 0;
    do {
        part = parsePart(p);
        if (part.condition) {
            conditions++;
            conditional = true;
        }
        if (part.text) {
            // only one text partition is allowed per pattern
            if (text_partition) {
                throw new Error('Unexpected partition');
            }
            text_partition = part;
        }
        if (part.locale) {
            l10n_override = resolveLocale(part.locale);
        }
        partitions.push(part);
        more = p.charAt(part.pattern.length) === ';' ? 1 : 0;
        p = p.slice(part.pattern.length + more);
        i++;
    } while (more && i < 4 && conditions < 3);

    // No more than 4 sections and only 2 conditional statements: "1;2;else;txt"
    if (conditions > 2) {
        throw new Error('Unexpected condition');
    }
    if (more) {
        throw new Error('Unexpected partition');
    }

    // if this is not a conditional, then we ensure we have all 4 partitions
    if (!conditional) {
        // if we have less than 4 partitions - and one of them is .text, use it as the text one
        if (partitions.length < 4 && text_partition) {
            for (let pi = 0, pl = partitions.length; pi < pl; pi++) {
                if (partitions[pi] === text_partition) {
                    partitions.splice(pi, 1);
                }
            }
        }
        // missing positive
        if (partitions.length < 1 && text_partition) {
            partitions[0] = parsePart('General');
            partitions[0].generated = true;
        }
        // missing negative
        if (partitions.length < 2) {
            const part = parsePart(partitions[0].pattern);
            // the volatile minus only happens if there is a single pattern
            part.tokens.unshift({ type: 'minus', volatile: true });
            part.generated = true;
            partitions.push(part);
        }
        // missing zero
        if (partitions.length < 3) {
            const part = parsePart(partitions[0].pattern);
            part.generated = true;
            partitions.push(part);
        }
        // missing text
        if (partitions.length < 4) {
            if (text_partition) {
                partitions.push(text_partition);
            } else {
                const part = parsePart('@');
                part.generated = true;
                partitions.push(part);
            }
        }

        partitions[0].condition = ['>', 0];
        partitions[1].condition = ['<', 0];
        partitions[2].condition = null;
    }

    return {
        pattern,
        partitions,
        locale: l10n_override,
    };
}

export function parseCatch(pattern: string): PatternType {
    try {
        return parsePattern(pattern);
    } catch (err) {
        const errPart = { tokens: [{ type: 'error' }] };
        return {
            pattern,
            locale: null,
            partitions: [errPart, errPart, errPart, errPart],
            error: err.message,
        };
    }
}
