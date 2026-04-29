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

import type { DrawingInfo } from '../utils/parse/parse-drawing';
import type { XmlNode } from '../utils/parse/xml';
import { describe, expect, it } from 'vitest';
import { parseRunsFromPNode } from '../utils/parse/parse-run';
import { xmlParser } from '../utils/parse/xml';

function parsePNode(xml: string): XmlNode {
    const parsed = xmlParser.parse(xml) as XmlNode[];
    return parsed[0] as XmlNode;
}

describe('parseRunsFromPNode – drawing extraction', () => {
    it('w:r containing w:drawing → run with drawingId in runs and DrawingInfo in drawingsOut map', () => {
        const xml = `<w:p xmlns:w="x" xmlns:wp="wp" xmlns:a="a" xmlns:r="r" xmlns:pic="pic">
      <w:r>
        <w:drawing>
          <wp:inline>
            <wp:extent cx="952500" cy="952500"/>
            <a:graphic>
              <a:graphicData>
                <pic:pic><pic:blipFill><a:blip r:embed="rId9"/></pic:blipFill></pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>`;
        const pNode = parsePNode(xml);
        const drawings = new Map<string, DrawingInfo>();
        const runs = parseRunsFromPNode(pNode, drawings);

        expect(runs.length).toBe(1);
        expect(runs[0].text).toBe('');
        expect(runs[0].drawingId).toBeDefined();
        const drawingId = runs[0].drawingId!;
        expect(drawings.has(drawingId)).toBe(true);
        expect(drawings.get(drawingId)?.rId).toBe('rId9');
        expect(drawings.get(drawingId)?.widthPx).toBe(100);
    });

    it('w:r with both w:t and w:drawing → two runs (text run + drawing run)', () => {
        const xml = `<w:p xmlns:w="x" xmlns:wp="wp" xmlns:a="a" xmlns:r="r" xmlns:pic="pic">
      <w:r>
        <w:t>Hello</w:t>
        <w:drawing>
          <wp:inline>
            <wp:extent cx="190500" cy="190500"/>
            <a:graphic>
              <a:graphicData>
                <pic:pic><pic:blipFill><a:blip r:embed="rId2"/></pic:blipFill></pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>`;
        const pNode = parsePNode(xml);
        const drawings = new Map<string, DrawingInfo>();
        const runs = parseRunsFromPNode(pNode, drawings);

        const textRun = runs.find((r) => r.text === 'Hello');
        const drawingRun = runs.find((r) => r.drawingId !== undefined);
        expect(textRun).toBeDefined();
        expect(drawingRun).toBeDefined();
        expect(drawings.size).toBe(1);
    });

    it('w:r without w:drawing → drawingsOut map remains empty', () => {
        const xml = '<w:p xmlns:w="x"><w:r><w:t>plain</w:t></w:r></w:p>';
        const pNode = parsePNode(xml);
        const drawings = new Map<string, DrawingInfo>();
        const runs = parseRunsFromPNode(pNode, drawings);
        expect(runs).toEqual([{ text: 'plain' }]);
        expect(drawings.size).toBe(0);
    });

    it('w:drawing with no blip → run is skipped (no drawingId)', () => {
        const xml = `<w:p xmlns:w="x" xmlns:wp="wp">
      <w:r>
        <w:drawing>
          <wp:inline><wp:extent cx="100000" cy="100000"/></wp:inline>
        </w:drawing>
      </w:r>
    </w:p>`;
        const pNode = parsePNode(xml);
        const drawings = new Map<string, DrawingInfo>();
        const runs = parseRunsFromPNode(pNode, drawings);
        expect(runs.length).toBe(0);
        expect(drawings.size).toBe(0);
    });
});
