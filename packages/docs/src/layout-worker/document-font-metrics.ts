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

import { BooleanNumber, DEFAULT_STYLES } from '@univerjs/core';
import { FontCache, getFontStyleString } from '@univerjs/engine-render';

/** Collect once from the snapshot, then only from mutation payloads (including JSON1 font replacements). */
export function collectDocumentFontFamilies(value: unknown, families: Set<string>): void {
    if (value == null || typeof value !== 'object') {
        return;
    }
    if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index++) {
            const item = value[index];
            if (value[index - 1] === 'ff' && item != null && typeof item === 'object' && typeof item.i === 'string') {
                families.add(item.i);
            }
            collectDocumentFontFamilies(item, families);
        }
        return;
    }
    const textStyle = value as { ff?: unknown; eastAsiaFontFamily?: unknown };
    if (typeof textStyle.eastAsiaFontFamily === 'string' && textStyle.eastAsiaFontFamily.trim()) {
        // Shaping appends the fallback for Latin text and prepends it for East Asian glyphs.
        // Transfer both keys so Worker leading does not depend on prior UI shaping.
        const primary = typeof textStyle.ff === 'string' && textStyle.ff.trim() ? textStyle.ff : DEFAULT_STYLES.ff;
        families.add(`${primary}, ${textStyle.eastAsiaFontFamily.trim()}`);
        families.add(`${textStyle.eastAsiaFontFamily.trim()}, ${primary}, ${textStyle.eastAsiaFontFamily.trim()}`);
    }
    for (const [key, item] of Object.entries(value)) {
        if (key === 'ff' && typeof item === 'string') {
            families.add(item);
        } else {
            collectDocumentFontFamilies(item, families);
        }
    }
}

export function measureDocumentFontFamilies(families: Set<string>): Record<string, number> {
    FontCache.getNormalLineHeight(getFontStyleString());
    // Bold/italic may be inherited separately from the family in paragraph or run styles.
    for (const ff of ['', ...families]) {
        for (const bl of [BooleanNumber.FALSE, BooleanNumber.TRUE]) {
            for (const it of [BooleanNumber.FALSE, BooleanNumber.TRUE]) {
                FontCache.getNormalLineHeight(getFontStyleString({ ff, bl, it }));
            }
        }
    }
    return FontCache.getNormalLineHeightCache();
}
