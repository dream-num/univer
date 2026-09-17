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

import type { IDocumentBody, ISdtCustomRange } from '../types/interfaces/i-document-data';

export function getSdtBindingKey(range: ISdtCustomRange): string | undefined {
    const binding = range.properties?.dataBinding;
    if (!binding?.storeItemID || !binding.xpath) {
        return;
    }
    return JSON.stringify([binding.storeItemID.toLowerCase(), binding.xpath, binding.prefixMappings ?? '']);
}

/** Scalar XML values, independent of the control's display label or date format. */
export function getSdtBindingValue(body: IDocumentBody, range: ISdtCustomRange): string | undefined {
    if (range.properties.showingPlaceholder) {
        return '';
    }
    if (range.properties.kind === 'checkbox') {
        return range.properties.checkbox?.checked ? 'true' : 'false';
    }
    const text = body.dataStream.slice(range.startIndex, range.endIndex + 1)
        .replace(/^[\x00-\x08\x0A-\x1F]+|[\x00-\x08\x0A-\x1F]+$/g, '');
    if (range.properties.kind === 'date') {
        return range.properties.date?.fullDate ?? text;
    }
    if (range.properties.kind === 'dropDownList' || range.properties.kind === 'comboBox') {
        return range.properties.listItems?.find((item) => item.displayText === text)?.value ?? text;
    }
    return ['text', 'richText'].includes(range.properties.kind) ? text : undefined;
}
