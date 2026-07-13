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

import {
    CommandService,
    ConfigService,
    ContextService,
    CustomRangeType,
    DesktopLogService,
    DocumentDataModel,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    UniverInstanceService,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { describe, expect, it } from 'vitest';
import { DocAutoFormatService } from '../doc-auto-format.service';

function createService() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocAutoFormatService]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    univerInstanceService.__addUnit(new DocumentDataModel({
        id: 'doc-1',
        body: {
            dataStream: 'Hello world\r\n',
            paragraphs: [{ paragraphId: 'p1', startIndex: 11 }],
            sectionBreaks: [{ sectionId: 'section_fixture_228', startIndex: 13 }],
            customRanges: [{
                startIndex: 6,
                endIndex: 10,
                rangeId: 'range-world',
                rangeType: CustomRangeType.HYPERLINK,
            }],
            customBlocks: [],
        },
    }));
    univerInstanceService.focusUnit('doc-1');
    const selectionManager = injector.get(DocSelectionManagerService);
    selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'doc-1', subUnitId: 'doc-1' });

    return {
        service: injector.get(DocAutoFormatService),
        selectionManager,
    };
}

describe('DocAutoFormatService', () => {
    it('runs the highest priority matching auto-format for the active document selection', () => {
        const { service, selectionManager } = createService();
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 12,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null,
        }] as never);

        const lowPriority = service.registerAutoFormat({
            id: 'doc.command.tab',
            priority: 1,
            match: () => true,
            getMutations: () => [{ id: 'low-priority' }],
        });
        const highPriority = service.registerAutoFormat({
            id: 'doc.command.tab',
            priority: 10,
            match: (context) => context.isBody && context.paragraphs.length === 1 && context.customRanges.length === 1,
            getMutations: () => [{ id: 'high-priority' }],
        });

        expect(service.onAutoFormat('doc.command.tab', { shift: false })).toEqual([{ id: 'high-priority' }]);

        highPriority.dispose();
        expect(service.onAutoFormat('doc.command.tab', null)).toEqual([{ id: 'low-priority' }]);

        lowPriority.dispose();
        expect(service.onAutoFormat('doc.command.tab', null)).toEqual([]);
    });

    it('returns no mutations when there is no active selection for the command', () => {
        const { service } = createService();

        expect(service.onAutoFormat('doc.command.tab', null)).toEqual([]);
    });
});
