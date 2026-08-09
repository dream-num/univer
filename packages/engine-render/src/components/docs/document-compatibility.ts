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

import type { ITable } from '@univerjs/core';
import type {
    IDocumentSkeletonBoundingBox,
    IDocumentSkeletonFontStyle,
} from '../../basics/i-document-skeleton-cached';
import { DocumentFlavor } from '@univerjs/core';

interface IFontMetricScaleRule {
    fontFamily: RegExp;
    minFontSize?: number;
    fontString?: RegExp;
    content?: RegExp;
    widthScale?: number;
}

export interface IDocumentCompatibilityPolicy {
    mode: 'modern' | 'traditional' | 'unspecified';
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
                fontFamily: /^arial$/i,
                fontString: /^\S+\s+normal\s+\d+(?:\.\d+)?pt\s+["']?Arial["']?(?:,|$)/i,
                content: /^[\u0000-\u024F\u2000-\u206F]$/u,
                widthScale: 0.98,
            },
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

export function getDocumentCompatibilityPolicy(documentFlavor?: DocumentFlavor): IDocumentCompatibilityPolicy {
    if (documentFlavor === DocumentFlavor.MODERN) {
        return MODERN_DOCUMENT_COMPATIBILITY_POLICY;
    }

    if (documentFlavor === DocumentFlavor.TRADITIONAL) {
        return TRADITIONAL_DOCUMENT_COMPATIBILITY_POLICY;
    }

    return UNSPECIFIED_DOCUMENT_COMPATIBILITY_POLICY;
}

export function applyFontMetricCompatibility(
    content: string,
    fontStyle: IDocumentSkeletonFontStyle,
    bBox: IDocumentSkeletonBoundingBox,
    policy: IDocumentCompatibilityPolicy
): IDocumentSkeletonBoundingBox {
    const fontFamilies = fontStyle.fontFamily
        .split(',')
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ''));

    const rule = policy.font.metricScaleRules.find((rule) =>
        (rule.minFontSize == null || fontStyle.originFontSize >= rule.minFontSize) &&
        (rule.fontString == null || rule.fontString.test(fontStyle.fontString)) &&
        (rule.content == null || rule.content.test(content)) &&
        fontFamilies.some((family) => rule.fontFamily.test(family))
    );

    if (rule?.widthScale == null) {
        return bBox;
    }

    return {
        ...bBox,
        width: bBox.width * rule.widthScale,
    };
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
