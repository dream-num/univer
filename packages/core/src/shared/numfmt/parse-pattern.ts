/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

import type {
    ErrorFormatSection,
    ParsedFormatSection,
    ParsedPattern,
    RenderToken,
} from './types';
import { resolveLocale } from './locale';
import { parseFormatSection } from './parse-format-section';
import { tokenize } from './tokenize';

interface IGeneratedFormatSection extends ParsedFormatSection {
    generated?: boolean;
}

function maybeAddMinus(part: IGeneratedFormatSection): void {
    const operator = part.condition?.[0];
    const value = part.condition?.[1];
    const exception = (
        (typeof value === 'number' && value < 0 && (operator === '<' || operator === '<=' || operator === '=')) ||
        (value === 0 && operator === '<')
    );
    if (!exception) {
        part.tokens.unshift({
            type: 'minus',
            volatile: true,
        });
    }
}

function clonePart(part: IGeneratedFormatSection, prefixToken: RenderToken | null = null): IGeneratedFormatSection {
    const result: IGeneratedFormatSection = {
        ...part,
        int_pattern: [...part.int_pattern],
        frac_pattern: [...part.frac_pattern],
        man_pattern: [...part.man_pattern],
        den_pattern: [...part.den_pattern],
        num_pattern: [...part.num_pattern],
        tokens: [...part.tokens],
    };
    if (part.condition) {
        result.condition = [...part.condition];
    }
    if (prefixToken) {
        result.tokens.unshift(prefixToken);
    }
    result.generated = true;
    return result;
}

// eslint-disable-next-line max-lines-per-function, complexity
export function parsePattern(pattern: string): ParsedPattern {
    const partitions: IGeneratedFormatSection[] = [];
    let conditional = false;
    let localeOverride: string | null | undefined;
    let textPartition: IGeneratedFormatSection | null = null;
    let more = 0;
    let index = 0;
    let conditions = 0;
    let tokens = tokenize(pattern);
    do {
        const part: IGeneratedFormatSection = parseFormatSection(tokens);
        // Dates cannot blend with non-date tokens.
        // General cannot blend with non-date tokens.
        if (
            (part.date || part.general) &&
            (part.int_pattern.length || part.frac_pattern.length || part.scale !== 1 || part.text)
        ) {
            throw new Error('Illegal format');
        }
        if (part.condition) {
            conditions++;
            conditional = true;
        }
        if (part.text) {
            // only one text partition is allowed per pattern
            if (textPartition) {
                throw new Error('Unexpected partition');
            }
            textPartition = part;
        }
        if (part.locale) {
            localeOverride = resolveLocale(part.locale);
        }
        partitions.push(part);

        more = tokens[part.tokensUsed]?.type === 'break' ? 1 : 0;
        tokens = tokens.slice(part.tokensUsed + more);
        index++;
    } while (more && index < 4 && conditions < 3);

    // No more than 4 sections are allowed.
    if (more) {
        throw new Error('Unexpected partition');
    }
    // Only 2 conditional statements are allowed: "1;2;else;txt".
    if (conditions > 2) {
        throw new Error('Unexpected condition');
    }
    // 3rd part must be text or neutral if it is present.
    const fourthPart = partitions[3];
    if (fourthPart && (fourthPart.int_pattern.length || fourthPart.frac_pattern.length || fourthPart.date)) {
        throw new Error('Unexpected partition');
    }

    if (conditional) {
        // When a pattern has a single partition which exists in the second
        // partition, we must also set the first partition to `[>0]`.
        if (!partitions[0].condition) {
            partitions[0].condition = ['>', 0];
        }

        // Conditional patterns get a volatile minus on the "else" partitions.
        const numberOfParts = partitions.length;
        if (numberOfParts === 1) {
            // provide a fallback pattern if there isn't one
            const fallback: IGeneratedFormatSection = parseFormatSection(tokenize('General'));
            fallback.generated = true;
            partitions[1] = fallback;
        }
        if (numberOfParts <= 2) {
            // [<10]0;[>10]0 is valid but may not match a runtime value.
        }
        if (numberOfParts < 3) {
            const firstPart = partitions[0];
            const secondPart = partitions[1];
            maybeAddMinus(firstPart);
            if (secondPart.condition) {
                maybeAddMinus(secondPart);
            } else {
                const condition = firstPart.condition;
                if (
                    condition?.[0] === '=' ||
                    (typeof condition?.[1] === 'number' &&
                        condition[1] >= 0 &&
                        (condition[0] === '>' || condition[0] === '>='))
                ) {
                    secondPart.tokens.unshift({
                        type: 'minus',
                        volatile: true,
                    });
                }
            }
        } else {
            // 3 and 4 part patterns
            partitions.forEach(maybeAddMinus);
        }
    } else {
        // If there are fewer than 4 partitions and one is text, reserve it for text.
        if (partitions.length < 4 && textPartition) {
            for (let partitionIndex = 0, length = partitions.length; partitionIndex < length; partitionIndex++) {
                if (partitions[partitionIndex] === textPartition) {
                    partitions.splice(partitionIndex, 1);
                }
            }
        }
        // missing positive
        if (partitions.length < 1 && textPartition) {
            const positive: IGeneratedFormatSection = parseFormatSection(tokenize('General'));
            positive.generated = true;
            partitions[0] = positive;
        }
        // missing negative
        if (partitions.length < 2) {
            const volatileMinus: RenderToken = { type: 'minus', volatile: true };
            partitions.push(clonePart(partitions[0], volatileMinus));
        }
        // missing zero
        if (partitions.length < 3) {
            partitions.push(clonePart(partitions[0]));
        }
        // missing text
        if (partitions.length < 4) {
            if (textPartition) {
                partitions.push(textPartition);
            } else {
                const text: IGeneratedFormatSection = parseFormatSection(tokenize('@'));
                text.generated = true;
                partitions.push(text);
            }
        }

        partitions[0].condition = ['>', 0];
        partitions[1].condition = ['<', 0];
        partitions[2].condition = null;
    }

    return {
        pattern,
        partitions,
        locale: localeOverride,
    };
}

export function parseCatch(pattern: string): ParsedPattern {
    try {
        return parsePattern(pattern);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const errorPart: ErrorFormatSection = {
            tokens: [{ type: 'error' }],
            error: message,
        };
        return {
            pattern,
            partitions: [errorPart, errorPart, errorPart, errorPart],
            error: message,
            locale: null,
        };
    }
}
