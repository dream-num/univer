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
    DesktopLogService,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentBlockRangeType,
    DocumentDataModel,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    UniverInstanceService,
} from '@univerjs/core';
import { DocSelectionManagerService, SetTextSelectionsOperation } from '@univerjs/docs';
import { NORMAL_TEXT_SELECTION_PLUGIN_STYLE } from '@univerjs/engine-render';
import { ComponentManager } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { DocCanvasPopManagerService } from '../doc-popup-manager.service';
import { DocFloatMenuService } from '../float-menu.service';
import { DocSelectionRenderService } from '../selection/doc-selection-render.service';

class InertDocCanvasPopManagerService {
    attachPopupToRange() {
        throw new Error('Internal editors should not attach float menu popups.');
    }
}

class InertDocSelectionRenderService {
    onSelectionStart$ = new Subject().asObservable();
}

class RecordingDocCanvasPopManagerService {
    readonly ranges: string[] = [];
    disposedCount = 0;

    attachPopupToRange(range: { startOffset: number; endOffset: number }) {
        this.ranges.push(`${range.startOffset}:${range.endOffset}`);

        return {
            dispose: () => {
                this.disposedCount++;
            },
        };
    }
}

class ActiveDocSelectionRenderService {
    private readonly _selectionStart$ = new Subject<void>();
    readonly onSelectionStart$ = this._selectionStart$.asObservable();

    emitSelectionStart() {
        this._selectionStart$.next();
    }
}

const InertDocCanvasPopManagerServiceCtor = InertDocCanvasPopManagerService as unknown as typeof DocCanvasPopManagerService;
const InertDocSelectionRenderServiceCtor = InertDocSelectionRenderService as unknown as typeof DocSelectionRenderService;
const RecordingDocCanvasPopManagerServiceCtor = RecordingDocCanvasPopManagerService as unknown as typeof DocCanvasPopManagerService;
const ActiveDocSelectionRenderServiceCtor = ActiveDocSelectionRenderService as unknown as typeof DocSelectionRenderService;

describe('DocFloatMenuService', () => {
    it('does not register or show a floating toolbar inside internal document editors', () => {
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocCanvasPopManagerService, { useClass: InertDocCanvasPopManagerServiceCtor }]);
        injector.add([ComponentManager]);
        injector.add([DocSelectionRenderService, { useClass: InertDocSelectionRenderServiceCtor }]);

        const service = injector.createInstance(DocFloatMenuService, { unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY } as never);

        expect(service.floatMenu).toBeNull();
        expect(injector.get(ComponentManager).get('univer.doc.float-menu')).toBeUndefined();
    });

    it('shows one floating toolbar for a text selection and hides it when selection restarts', () => {
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocCanvasPopManagerService, { useClass: RecordingDocCanvasPopManagerServiceCtor }]);
        injector.add([ComponentManager]);
        injector.add([DocSelectionRenderService, { useClass: ActiveDocSelectionRenderServiceCtor }]);
        const commandService = injector.get(ICommandService);
        commandService.registerCommand(SetTextSelectionsOperation);
        const unitId = 'doc-float-menu';
        const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
        univerInstanceService.__addUnit(new DocumentDataModel({
            id: unitId,
            body: {
                dataStream: 'Hello world\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_float_menu_fixture_1', startIndex: 11 }],
                sectionBreaks: [],
                customRanges: [],
                tables: [],
                textRuns: [],
            },
        }));

        const service = injector.createInstance(DocFloatMenuService, { unitId } as never);
        const selectionManager = injector.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId, subUnitId: unitId });
        selectionManager.__replaceTextRangesWithNoRefresh({
            textRanges: [{
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
            }],
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            isEditing: true,
        }, { unitId, subUnitId: unitId });
        selectionManager.__replaceTextRangesWithNoRefresh({
            textRanges: [{
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
            }],
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            isEditing: true,
        }, { unitId, subUnitId: unitId });

        const popupService = injector.get(DocCanvasPopManagerService) as unknown as RecordingDocCanvasPopManagerService;
        expect(popupService.ranges).toEqual(['0:5']);
        expect(service.floatMenu).toMatchObject({ start: 0, end: 5 });

        const selectionRenderService = injector.get(DocSelectionRenderService) as unknown as ActiveDocSelectionRenderService;
        selectionRenderService.emitSelectionStart();
        expect(service.floatMenu).toBeNull();
        expect(popupService.disposedCount).toBe(1);
    });

    it('does not show the floating toolbar for selections inside code blocks', () => {
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocCanvasPopManagerService, { useClass: RecordingDocCanvasPopManagerServiceCtor }]);
        injector.add([ComponentManager]);
        injector.add([DocSelectionRenderService, { useClass: ActiveDocSelectionRenderServiceCtor }]);
        injector.get(ICommandService).registerCommand(SetTextSelectionsOperation);
        const unitId = 'doc-code-menu';
        const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
        univerInstanceService.__addUnit(new DocumentDataModel({
            id: unitId,
            body: {
                dataStream: 'const x = 1;\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_float_menu_fixture_2', startIndex: 12 }],
                sectionBreaks: [],
                customRanges: [],
                tables: [],
                textRuns: [],
                blockRanges: [{
                    blockType: DocumentBlockRangeType.CODE,
                    startIndex: 0,
                    endIndex: 12,
                    blockId: 'code-1',
                }],
            },
        }));

        const service = injector.createInstance(DocFloatMenuService, { unitId } as never);
        const selectionManager = injector.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId, subUnitId: unitId });
        selectionManager.__replaceTextRangesWithNoRefresh({
            textRanges: [{
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
            }],
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            isEditing: true,
        }, { unitId, subUnitId: unitId });

        const popupService = injector.get(DocCanvasPopManagerService) as unknown as RecordingDocCanvasPopManagerService;
        expect(service.floatMenu).toBeNull();
        expect(popupService.ranges).toEqual([]);
    });
});
