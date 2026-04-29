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

import type { ParsedRelationship } from './types';
import { findChildren, nodeAttrs, nodeName, xmlParser } from './xml';

// TODO(unsupported): TargetMode=External vs Internal distinction not preserved,
//   header/footer relationship files (.rels for header1.xml etc.) not parsed

const HYPERLINK_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink';
const IMAGE_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image';

export function parseRelationships(relsXml: string | undefined): Map<string, ParsedRelationship> {
    const result = new Map<string, ParsedRelationship>();
    if (!relsXml) return result;

    let parsed: Array<Record<string, unknown>>;
    try {
        parsed = xmlParser.parse(relsXml) as Array<Record<string, unknown>>;
    } catch {
        return result;
    }

    const root = parsed.find((n) => nodeName(n) === 'Relationships');
    if (!root) return result;

    for (const rel of findChildren(root, 'Relationship')) {
        const a = nodeAttrs(rel);
        const id = a['@_Id'];
        const type = a['@_Type'];
        const target = a['@_Target'] ?? '';
        if (!id) continue;
        let kind: ParsedRelationship['type'] = 'other';
        if (type === HYPERLINK_TYPE) kind = 'hyperlink';
        else if (type === IMAGE_TYPE) kind = 'image';
        result.set(id, { type: kind, target });
    }

    return result;
}
