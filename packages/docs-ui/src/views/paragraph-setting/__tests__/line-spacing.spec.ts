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

import { SpacingRule } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import {
    convertDisplayLineSpacingToStoredValue,
    convertLineSpacingForRuleChange,
    convertStoredLineSpacingToDisplayValue,
    getLineSpacingInputConfig,
    LINE_SPACING_RULE_OPTIONS,
} from '../line-spacing';

describe('paragraph line spacing helpers', () => {
    it('exposes Word-style spacing rule options', () => {
        expect(LINE_SPACING_RULE_OPTIONS).toEqual([
            { label: 'docs-ui.doc.paragraphSetting.multiSpace', value: `${SpacingRule.AUTO}` },
            { label: 'docs-ui.doc.paragraphSetting.atLeast', value: `${SpacingRule.AT_LEAST}` },
            { label: 'docs-ui.doc.paragraphSetting.exactly', value: `${SpacingRule.EXACT}` },
        ]);
    });

    it('uses separate input ranges for multiple and fixed spacing', () => {
        expect(getLineSpacingInputConfig(SpacingRule.AUTO)).toEqual({ min: 1, max: 5, step: 0.1 });
        expect(getLineSpacingInputConfig(SpacingRule.AT_LEAST)).toEqual({ min: 1, max: 100 });
        expect(getLineSpacingInputConfig(SpacingRule.EXACT)).toEqual({ min: 1, max: 100 });
    });

    it('keeps fixed spacing values in pixels to avoid changing existing input semantics', () => {
        expect(convertStoredLineSpacingToDisplayValue(24, SpacingRule.EXACT)).toBeCloseTo(24, 4);
        expect(convertDisplayLineSpacingToStoredValue(18, SpacingRule.EXACT)).toBeCloseTo(18, 4);
        expect(convertStoredLineSpacingToDisplayValue(1.5, SpacingRule.AUTO)).toBe(1.5);
    });

    it('preserves the current rendered height when switching between multiple and exact spacing', () => {
        const toExact = convertLineSpacingForRuleChange(1.5, SpacingRule.AUTO, SpacingRule.EXACT, {
            glyphLineHeight: 16,
            renderedLineHeight: 24,
        });
        const backToAuto = convertLineSpacingForRuleChange(toExact, SpacingRule.EXACT, SpacingRule.AUTO, {
            glyphLineHeight: 16,
            renderedLineHeight: 24,
        });

        expect(toExact).toBeCloseTo(24, 4);
        expect(backToAuto).toBeCloseTo(1.5, 4);
    });
});
