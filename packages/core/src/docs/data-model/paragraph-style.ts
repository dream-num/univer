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

import type { Nullable } from '../../shared';
import type { IDocumentStyle, IParagraphStyle } from '../../types/interfaces';
import { Tools } from '../../shared';
import {
    DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING,
    DEFAULT_DOCUMENT_PARAGRAPH_SPACE_ABOVE,
    DEFAULT_DOCUMENT_PARAGRAPH_SPACE_BELOW,
    NAMED_STYLE_SPACE_MAP,
} from '../../types/const';
import { DocumentFlavor } from '../../types/interfaces';

export interface IResolveDocumentParagraphStyleOptions {
    excludeDocumentOuterSpacing?: boolean;
    useLegacyModernDefaults?: boolean;
}

function _definedStyle(style: Nullable<IParagraphStyle>): IParagraphStyle {
    if (style == null) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(style).filter(([, value]) => value != null)
    ) as IParagraphStyle;
}

export function resolveDocumentParagraphStyle(
    documentStyle: Nullable<IDocumentStyle>,
    paragraphStyle: Nullable<IParagraphStyle>,
    options: IResolveDocumentParagraphStyleOptions = {}
): IParagraphStyle {
    const useLegacyModernDefaults = options.useLegacyModernDefaults ??
        documentStyle?.documentFlavor === DocumentFlavor.MODERN;
    const legacyStyle: IParagraphStyle = useLegacyModernDefaults
        ? {
            lineSpacing: DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING,
            spaceAbove: { v: DEFAULT_DOCUMENT_PARAGRAPH_SPACE_ABOVE },
            spaceBelow: { v: DEFAULT_DOCUMENT_PARAGRAPH_SPACE_BELOW },
        }
        : {};
    const documentDefaults = {
        ...legacyStyle,
        ..._definedStyle(documentStyle?.defaultParagraphStyle),
    };

    if (options.excludeDocumentOuterSpacing) {
        delete documentDefaults.spaceAbove;
        delete documentDefaults.spaceBelow;
    }

    const definedParagraphStyle = _definedStyle(paragraphStyle);
    const namedStyle = definedParagraphStyle.namedStyleType == null
        ? null
        : NAMED_STYLE_SPACE_MAP[definedParagraphStyle.namedStyleType];

    return Tools.deepClone({
        ...documentDefaults,
        ...namedStyle,
        ...definedParagraphStyle,
    });
}
