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

import type { IDocumentSkeletonLine } from '@univerjs/engine-render';
import type { LocaleKey } from '../../locale/types';
import { DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING, DEFAULT_STYLES, SpacingRule } from '@univerjs/core';

interface ILineSpacingMetrics {
    glyphLineHeight: number;
    renderedLineHeight: number;
}

const AUTO_LINE_SPACING_CONFIG = { min: 1, max: 5, step: 0.1 } as const;
const FIXED_LINE_SPACING_CONFIG = { min: 1, max: 100 } as const;

function round(value: number, digits: number) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export const LINE_SPACING_RULE_OPTIONS: Array<{ label: LocaleKey; value: string }> = [
    { label: 'docs-ui.doc.paragraphSetting.multiSpace', value: `${SpacingRule.AUTO}` },
    { label: 'docs-ui.doc.paragraphSetting.atLeast', value: `${SpacingRule.AT_LEAST}` },
    { label: 'docs-ui.doc.paragraphSetting.exactly', value: `${SpacingRule.EXACT}` },
];

export function getLineSpacingInputConfig(spacingRule: SpacingRule) {
    return spacingRule === SpacingRule.AUTO ? AUTO_LINE_SPACING_CONFIG : FIXED_LINE_SPACING_CONFIG;
}

export function convertStoredLineSpacingToDisplayValue(lineSpacing: number, spacingRule: SpacingRule) {
    return spacingRule === SpacingRule.AUTO ? lineSpacing : round(lineSpacing, 2);
}

export function convertDisplayLineSpacingToStoredValue(lineSpacing: number, spacingRule: SpacingRule) {
    return spacingRule === SpacingRule.AUTO ? lineSpacing : round(lineSpacing, 4);
}

export function getLineSpacingMetrics(lineNode?: IDocumentSkeletonLine): ILineSpacingMetrics | null {
    if (!lineNode) {
        return null;
    }

    const glyphLineHeight = Math.max(
        0,
        ...(lineNode.divides ?? []).flatMap((divide) =>
            (divide.glyphGroup ?? []).map((glyph) => (glyph.bBox?.ba ?? 0) + (glyph.bBox?.bd ?? 0))
        )
    ) || lineNode.contentHeight || 0;

    if (!glyphLineHeight) {
        return null;
    }

    const renderedLineHeight = (lineNode.paddingTop ?? 0) + (lineNode.contentHeight ?? glyphLineHeight) + (lineNode.paddingBottom ?? 0);

    return {
        glyphLineHeight,
        renderedLineHeight: renderedLineHeight || glyphLineHeight,
    };
}

export function convertLineSpacingForRuleChange(
    currentStoredValue: number,
    currentRule: SpacingRule,
    nextRule: SpacingRule,
    metrics?: ILineSpacingMetrics | null
) {
    if (currentRule === nextRule) {
        return currentStoredValue;
    }

    if (nextRule === SpacingRule.AUTO) {
        if (metrics?.glyphLineHeight && metrics.renderedLineHeight) {
            return round(clamp(metrics.renderedLineHeight / metrics.glyphLineHeight, AUTO_LINE_SPACING_CONFIG.min, AUTO_LINE_SPACING_CONFIG.max), 2);
        }

        return DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING;
    }

    if (metrics?.renderedLineHeight) {
        return round(metrics.renderedLineHeight, 4);
    }

    return round(DEFAULT_STYLES.fs * currentStoredValue, 4);
}
