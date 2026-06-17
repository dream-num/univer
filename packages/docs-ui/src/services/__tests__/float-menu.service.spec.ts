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
    DataStreamTreeTokenType,
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
    RANGE_DIRECTION,
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
    readonly directions: string[] = [];
    disposedCount = 0;

    attachPopupToRange(range: { startOffset: number; endOffset: number }, options: { direction: string }) {
        this.ranges.push(`${range.startOffset}:${range.endOffset}`);
        this.directions.push(options.direction);

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

function createActiveFloatMenuHarness(unitId: string, body: ConstructorParameters<typeof DocumentDataModel>[0]['body']) {
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
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    univerInstanceService.__addUnit(new DocumentDataModel({ id: unitId, body }));
    const service = injector.createInstance(DocFloatMenuService, { unitId } as never);
    const selectionManager = injector.get(DocSelectionManagerService);
    selectionManager.__TEST_ONLY_setCurrentSelection({ unitId, subUnitId: unitId });

    return {
        injector,
        popupService: injector.get(DocCanvasPopManagerService) as unknown as RecordingDocCanvasPopManagerService,
        selectionManager,
        service,
        univerInstanceService,
    };
}

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

    it('skips document control tokens and whole custom ranges when deciding whether text needs a toolbar', () => {
        const unitId = 'doc-token-menu';
        const { popupService, selectionManager, service } = createActiveFloatMenuHarness(unitId, {
            dataStream: `A${DataStreamTreeTokenType.PARAGRAPH}Link\r\n`,
            paragraphs: [{ paragraphId: 'para_docs_ui_float_menu_fixture_3', startIndex: 6 }],
            sectionBreaks: [],
            customRanges: [{
                startIndex: 2,
                endIndex: 5,
                rangeId: 'hyperlink-1',
                rangeType: CustomRangeType.HYPERLINK,
                wholeEntity: true,
            }],
            tables: [],
            textRuns: [],
        });

        selectionManager.__replaceTextRangesWithNoRefresh({
            textRanges: [{
                startOffset: 1,
                endOffset: 2,
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
                startOffset: 2,
                endOffset: 6,
                collapsed: false,
            }],
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            isEditing: true,
        }, { unitId, subUnitId: unitId });

        expect(service.floatMenu).toBeNull();
        expect(popupService.ranges).toEqual([]);
    });

    it('does not show the floating toolbar when the document is disabled', () => {
        const unitId = 'doc-disabled-menu';
        const { popupService, selectionManager, service, univerInstanceService } = createActiveFloatMenuHarness(unitId, {
            dataStream: 'Locked text\r\n',
            paragraphs: [{ paragraphId: 'para_docs_ui_float_menu_fixture_4', startIndex: 11 }],
            sectionBreaks: [],
            customRanges: [],
            tables: [],
            textRuns: [],
        });
        univerInstanceService.getUnit<DocumentDataModel>(unitId)?.setDisabled(true);

        selectionManager.__replaceTextRangesWithNoRefresh({
            textRanges: [{
                startOffset: 0,
                endOffset: 6,
                collapsed: false,
            }],
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            isEditing: true,
        }, { unitId, subUnitId: unitId });

        expect(service.floatMenu).toBeNull();
        expect(popupService.ranges).toEqual([]);
    });

    it('places the floating toolbar below a forward selection that spans multiple lines', () => {
        const unitId = 'doc-direction-menu';
        const { popupService, selectionManager, service } = createActiveFloatMenuHarness(unitId, {
            dataStream: 'First line\rSecond line\r\n',
            paragraphs: [
                { paragraphId: 'para_docs_ui_float_menu_fixture_5', startIndex: 10 },
                { paragraphId: 'para_docs_ui_float_menu_fixture_6', startIndex: 22 },
            ],
            sectionBreaks: [],
            customRanges: [],
            tables: [],
            textRuns: [],
        });

        selectionManager.__replaceTextRangesWithNoRefresh({
            textRanges: [{
                startOffset: 0,
                endOffset: 18,
                collapsed: false,
                direction: RANGE_DIRECTION.FORWARD,
                startNodePosition: { page: 0, section: 0, column: 0, line: 0, divide: 0, glyph: 0, isBack: false } as never,
                endNodePosition: { page: 0, section: 0, column: 0, line: 1, divide: 0, glyph: 4, isBack: false } as never,
            }],
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            isEditing: true,
        }, { unitId, subUnitId: unitId });

        expect(service.floatMenu).toMatchObject({ start: 0, end: 18 });
        expect(popupService.ranges).toEqual(['0:18']);
        expect(popupService.directions).toEqual(['bottom-center']);

        service.dispose();
        expect(popupService.disposedCount).toBe(1);
    });
});
