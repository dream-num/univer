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

import { describe, expect, it } from 'vitest';
import { parseRelationships } from '../utils/parse/parse-hyperlink';

describe('parseRelationships', () => {
    it('returns empty map for undefined', () => {
        expect(parseRelationships(undefined).size).toBe(0);
    });

    it('extracts hyperlink rels', () => {
        const rels = `<?xml version="1.0"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com" TargetMode="External"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
</Relationships>`;
        const map = parseRelationships(rels);
        expect(map.get('rId1')).toEqual({ type: 'hyperlink', target: 'https://example.com' });
        expect(map.get('rId2')).toEqual({ type: 'image', target: 'media/image1.png' });
    });
});
