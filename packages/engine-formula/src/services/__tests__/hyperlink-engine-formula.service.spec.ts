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

import { Injector, IUniverInstanceService } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { HyperlinkEngineFormulaService, IHyperlinkEngineFormulaService } from '../hyperlink-engine-formula.service';

describe('HyperlinkEngineFormulaService', () => {
    let service: IHyperlinkEngineFormulaService;

    beforeEach(() => {
        const injector = new Injector();
        class TestUniverInstanceService {}

        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([IHyperlinkEngineFormulaService, { useClass: HyperlinkEngineFormulaService }]);
        service = injector.get(IHyperlinkEngineFormulaService);
    });

    it('does not create hyperlink payload for blank labels', () => {
        expect(service.generateCellValue('https://example.com', '   ')).toEqual({ v: '' });
    });

    it('normalizes valid URLs before writing rich-text hyperlink payloads', () => {
        const cell = service.generateCellValue('example.com', 'Example');

        expect(JSON.stringify(cell.p)).toContain('https://example.com');
        expect(JSON.stringify(cell.p)).toContain('Example');
    });
});
