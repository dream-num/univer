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

import type { IDocumentStyle, ITable, ITextStyle, Nullable } from '@univerjs/core';
import { BaselineOffset, DEFAULT_STYLES, DocumentFlavor } from '@univerjs/core';
import type {
    IDocumentSkeletonBoundingBox,
    IDocumentSkeletonFontStyle,
} from '../../basics/i-document-skeleton-cached';
import { cjk } from '../../basics/cjk-regexp';
import { getFontStyleString } from '../../basics/tools';

interface IFontMetricScaleRule {
    fontFamily: RegExp;
    minFontSize?: number;
    fontString?: RegExp;
    content?: RegExp;
    widthScale?: number;
}

export interface IDocumentCompatibilityPolicy {
    mode: 'modern' | 'traditional' | 'unspecified' | 'drawingml';
    applyDocumentDefaultParagraphStyle: boolean;
    useWordStyleLineHeight: boolean;
    font: {
        metricScaleRules: IFontMetricScaleRule[];
    };
    table: {
        currentPageOverflowTolerance: number;
        rowOverflowTolerance: number;
        allowImportedTableMarginOverflow: boolean;
    };
}

const MODERN_DOCUMENT_COMPATIBILITY_POLICY: IDocumentCompatibilityPolicy = {
    mode: 'modern',
    applyDocumentDefaultParagraphStyle: true,
    useWordStyleLineHeight: true,
    font: {
        metricScaleRules: [],
    },
    table: {
        currentPageOverflowTolerance: 0,
        rowOverflowTolerance: 0,
        allowImportedTableMarginOverflow: false,
    },
};

const TRADITIONAL_DOCUMENT_COMPATIBILITY_POLICY: IDocumentCompatibilityPolicy = {
    mode: 'traditional',
    applyDocumentDefaultParagraphStyle: false,
    useWordStyleLineHeight: true,
    font: {
        metricScaleRules: [
            {
                fontFamily: /^calibri$/i,
                minFontSize: 20,
                fontString: /\bbold\b/i,
                content: /^[\d/]+$/u,
                widthScale: 0.92,
            },
            {
                fontFamily: /^(?:宋体|SimSun)$/i,
                content: /^[\u2E80-\u2FFF\u31C0-\u31EF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]$/u,
                widthScale: 0.97,
            },
        ],
    },
    table: {
        currentPageOverflowTolerance: 12,
        rowOverflowTolerance: 4,
        allowImportedTableMarginOverflow: true,
    },
};

const TRADITIONAL_DOCUMENT_COMPATIBILITY_WITHOUT_FONT_METRIC_SCALE_POLICY: IDocumentCompatibilityPolicy = {
    ...TRADITIONAL_DOCUMENT_COMPATIBILITY_POLICY,
    font: {
        metricScaleRules: [],
    },
};

const UNSPECIFIED_DOCUMENT_COMPATIBILITY_POLICY: IDocumentCompatibilityPolicy = {
    mode: 'unspecified',
    applyDocumentDefaultParagraphStyle: false,
    useWordStyleLineHeight: false,
    font: {
        metricScaleRules: [],
    },
    table: {
        currentPageOverflowTolerance: 0,
        rowOverflowTolerance: 0,
        allowImportedTableMarginOverflow: false,
    },
};

const DRAWINGML_COMPATIBILITY_POLICY: IDocumentCompatibilityPolicy = {
    ...UNSPECIFIED_DOCUMENT_COMPATIBILITY_POLICY,
    mode: 'drawingml',
};

export function getDocumentCompatibilityPolicy(
    documentFlavor?: DocumentFlavor,
    fontMetricScaleEnabled = true
): IDocumentCompatibilityPolicy {
    if (documentFlavor === DocumentFlavor.DRAWINGML) {
        return DRAWINGML_COMPATIBILITY_POLICY;
    }
    if (documentFlavor === DocumentFlavor.MODERN) {
        return MODERN_DOCUMENT_COMPATIBILITY_POLICY;
    }

    if (documentFlavor === DocumentFlavor.TRADITIONAL) {
        return fontMetricScaleEnabled
            ? TRADITIONAL_DOCUMENT_COMPATIBILITY_POLICY
            : TRADITIONAL_DOCUMENT_COMPATIBILITY_WITHOUT_FONT_METRIC_SCALE_POLICY;
    }

    return UNSPECIFIED_DOCUMENT_COMPATIBILITY_POLICY;
}

export function applyFontMetricCompatibility(
    content: string,
    fontStyle: IDocumentSkeletonFontStyle,
    bBox: IDocumentSkeletonBoundingBox,
    policy: IDocumentCompatibilityPolicy
): IDocumentSkeletonBoundingBox {
    if (policy.mode === 'drawingml') {
        // PowerPoint's measured advances use eighths of a slide-layout unit.
        return { ...bBox, width: Math.round(bBox.width * 8) / 8 };
    }
    // Canvas quantizes fractional font sizes (10pt Han advances can become 13.330px).
    // Recover the nominal em only for already full-width CJK glyphs; leave proportional
    // glyphs, explicit half-width forms, and their actual ink/vertical metrics unchanged.
    const em = fontStyle.fontSize / 0.75;
    const width = policy.mode === 'traditional' && Array.from(content).length === 1 && cjk.hasCJK(content)
        && Math.abs(bBox.width - em) < 0.01
        ? em
        : bBox.width;
    const fontFamilies = fontStyle.fontFamily
        .split(',')
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ''));

    const rule = policy.font.metricScaleRules.find((rule) =>
        (rule.minFontSize == null || fontStyle.originFontSize >= rule.minFontSize) &&
        (rule.fontString == null || rule.fontString.test(fontStyle.fontString)) &&
        (rule.content == null || rule.content.test(content)) &&
        fontFamilies.some((family) => rule.fontFamily.test(family))
    );

    const adjustedWidth = width * (rule?.widthScale ?? 1);
    let normalLineHeight = bBox.normalLineHeight;
    let lineLeading = bBox.lineLeading;
    if (policy.mode === 'traditional' && /^(?:SimSun|宋体)$/i.test(fontFamilies[0])
        && Math.abs(bBox.ba + bBox.bd - em) < 0.01) {
        // Native Word probes at 7.5, 11, 12 and 16pt add roughly 30% auto-leading
        // to SimSun's one-em box, including Latin text. Retain ink and exact spacing.
        normalLineHeight = Math.max(normalLineHeight ?? 0, em * 1.3);
    }
    if (policy.mode === 'traditional' && /^(?:Microsoft YaHei|微软雅黑)$/i.test(fontFamilies[0])
        && Math.abs((bBox.ba + bBox.bd) / (fontStyle.originFontSize / 0.75) - 2703 / 2048) < 0.001) {
        // Word's single spacing adds leading to YaHei's font box. Isolated native
        // Word probes at 7.5pt and 12pt measure 17.12px and 27.52px baseline advances.
        // Guard the actual font metrics so a missing/substituted font is not inflated.
        // AUTO and AT_LEAST consume this value; keep ink and exact line metrics.
        normalLineHeight = Math.max(normalLineHeight ?? 0, (bBox.ba + bBox.bd) * 1.3);
    }
    if (policy.mode === 'traditional'
        && fontFamilies.some((family) => /^(?:DengXian|等线)$/i.test(family))
        && Math.abs((bBox.ba + bBox.bd) / (fontStyle.originFontSize / 0.75) - 2134 / 2048) < 0.001) {
        // Word uses the same DengXian leading for Latin text and paragraph marks.
        // Inline objects share that line box; retain the actual font and ink metrics.
        const wordLineHeight = (bBox.ba + bBox.bd) * 1.3;
        if ((normalLineHeight ?? 0) < wordLineHeight) {
            normalLineHeight = wordLineHeight;
            lineLeading = wordLineHeight - bBox.ba - bBox.bd;
        }
    }
    if (policy.mode === 'traditional' && /^(?:MS Gothic|ＭＳ ゴシック)$/i.test(fontFamilies[0])
        && Math.abs(bBox.ba + bBox.bd - fontStyle.originFontSize / 0.75) < 0.01) {
        // Word adds auto-leading beyond MS Gothic's one-em font box, for Latin
        // text as well as symbols. Native Word probes at 11pt and 16pt confirm
        // this ratio; leave ink metrics and fixed/minimum line spacing intact.
        normalLineHeight = Math.max(normalLineHeight ?? 0, fontStyle.originFontSize / 0.75 * 83 / 64);
    }
    if (adjustedWidth === bBox.width && normalLineHeight === bBox.normalLineHeight) {
        return bBox;
    }

    return {
        ...bBox,
        width: adjustedWidth,
        ...(normalLineHeight != null ? { normalLineHeight } : {}),
        ...(lineLeading != null ? { lineLeading } : {}),
    };
}

export function getDocumentFontStyle(
    textStyle?: Nullable<ITextStyle>,
    fontFamilyFallbacks?: Record<string, string>,
    fontFamilyClasses?: IDocumentStyle['fontFamilyClasses'],
    policy?: IDocumentCompatibilityPolicy
): IDocumentSkeletonFontStyle {
    let wordScriptSizeRatio: number | undefined;
    if ((policy?.mode === 'traditional' || policy?.mode === 'modern') &&
        (textStyle?.va === BaselineOffset.SUPERSCRIPT || textStyle?.va === BaselineOffset.SUBSCRIPT)) {
        const family = (textStyle.ff || DEFAULT_STYLES.ff).split(',')[0].trim().replace(/^['"]|['"]$/g, '');
        if (/^(?:SimSun|宋体|DengXian|等线|PMingLiU)$/i.test(family)) {
            wordScriptSizeRatio = 0.5;
        } else if (/^(?:Arial|Arial Narrow|Times|Times New Roman|Calibri|Cambria|Segoe UI|Consolas|Microsoft YaHei|微软雅黑|Franklin Gothic Book|Georgia|Lucida Sans Unicode|Open Sans|Symbol|Tahoma)$/i.test(family)) {
            wordScriptSizeRatio = 1331 / 2048;
        } else if (/^Aptos$/i.test(family)) {
            wordScriptSizeRatio = 1229 / 2048;
        } else if (/^Palatino Linotype$/i.test(family)) {
            wordScriptSizeRatio = 1230 / 2048;
        } else if (/^Sylfaen$/i.test(family)) {
            wordScriptSizeRatio = 1220 / 2048;
        } else if (/^Gungsuh$/i.test(family)) {
            wordScriptSizeRatio = 665 / 1024;
        } else if (/^(?:MS Mincho|HGS明朝E)$/i.test(family)) {
            // Word uses its legacy script scale for these faces despite their OS/2 size.
            wordScriptSizeRatio = 0.6;
        }
        // shortcut: unverified faces retain existing metrics until their Word script metrics are available.
    }
    return getFontStyleString(textStyle, fontFamilyFallbacks, fontFamilyClasses, wordScriptSizeRatio);
}

export function getSmallCapsFontStyle(
    raw: string,
    textStyle: ITextStyle | undefined,
    fontStyle: IDocumentSkeletonFontStyle,
    policy: IDocumentCompatibilityPolicy
): IDocumentSkeletonFontStyle {
    if (!textStyle?.smallCaps || textStyle.caps || raw === raw.toUpperCase()) {
        return fontStyle;
    }
    // Native Office uses synthetic 80% capitals; Word rounds the size to half-points.
    // Keep the authored size for line metrics and kerning-threshold decisions.
    const size = fontStyle.originFontSize * 0.8;
    const fs = policy.mode === 'drawingml' ? size : Math.max(0.5, Math.round(size * 2) / 2);
    return {
        ...getDocumentFontStyle({ ...textStyle, fs }, undefined, undefined, policy),
        originFontSize: fontStyle.originFontSize,
        fontKerning: fontStyle.fontKerning,
    };
}

export function getNominalFontLineHeight(fontSize: number, policy?: IDocumentCompatibilityPolicy): number | undefined {
    // Office renderer compatibility, not an OOXML-specified font metric.
    // Font sizes are points; the layout engine uses 96-DPI pixels.
    return policy?.mode === 'drawingml' && fontSize > 0 ? fontSize * 1.2 * (96 / 72) : undefined;
}

export function isTraditionalDocumentCompatibility(policy?: IDocumentCompatibilityPolicy): boolean {
    return policy?.mode === 'traditional';
}

export function shouldAllowImportedTableMarginOverflow(
    policy: IDocumentCompatibilityPolicy,
    tableSource: ITable | unknown
): boolean {
    if (!policy.table.allowImportedTableMarginOverflow || tableSource == null || typeof tableSource !== 'object') {
        return false;
    }

    const table = tableSource as Partial<ITable>;
    return table.size?.width != null;
}
