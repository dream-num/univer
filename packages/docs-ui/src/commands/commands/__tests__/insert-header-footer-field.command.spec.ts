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

import type { ICommand, IDocumentData } from '@univerjs/core';
import type { RenderUnit } from '@univerjs/engine-render';
import {
    BooleanNumber,
    CustomRangeType,
    DataStreamTreeTokenType,
    DocumentDataModel,
    DocumentFlavor,
    ICommandService,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    DocStateChangeManagerService,
    DocStateEmitService,
    InsertTextCommand,
    RichTextEditingMutation,
    setDocumentPermissionValue,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import {
    CanvasColorService,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
} from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { DocMenuStyleService } from '../../../services/doc-menu-style.service';
import { InsertHeaderFooterFieldCommand } from '../insert-header-footer-field.command';

const cleanups: Array<() => void> = [];
afterEach(() => {
    cleanups.splice(0).reverse().forEach((dispose) => dispose());
    vi.useRealTimers();
});

function createTestBed() {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 29, 13, 14, 15));
    const univer = new Univer();
    cleanups.push(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    injector.add([DocStateChangeManagerService]);
    injector.add([DocMenuStyleService]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'fields-doc',
        body: { dataStream: 'Body\r\n', paragraphs: [{ paragraphId: 'body-p', startIndex: 4 }] },
        headers: { header: { headerId: 'header', body: { dataStream: 'Page \r\n', customRanges: [], customDecorations: [], customBlocks: [], paragraphs: [{ paragraphId: 'header-p', startIndex: 5 }], textRuns: [{ st: 0, ed: 5, ts: { bl: BooleanNumber.TRUE } }] } } },
        footers: { footer: { footerId: 'footer', body: { dataStream: '\r\n', paragraphs: [{ paragraphId: 'footer-p', startIndex: 0 }] } } },
        documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, defaultHeaderId: 'header', defaultFooterId: 'footer', pageNumberStart: 9, pageSize: { width: 300, height: 400 }, marginTop: 40, marginBottom: 40 },
    });
    injector.get(IUniverInstanceService).focusUnit(model.getUnitId());
    const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
    render.deactivate();
    render.addRenderDependencies([[DocSkeletonManagerService]]);
    render.with(DocSkeletonManagerService).getSkeleton().calculate();
    const commands = injector.get(ICommandService);
    for (const command of [InsertHeaderFooterFieldCommand, InsertTextCommand, RichTextEditingMutation, SetTextSelectionsOperation]) {
        commands.registerCommand(command as ICommand);
    }
    injector.get(DocStateChangeManagerService);
    const selections = injector.get(DocSelectionManagerService);
    selections.__TEST_ONLY_setCurrentSelection({ unitId: model.getUnitId(), subUnitId: model.getUnitId() });
    selections.__TEST_ONLY_add([{ startOffset: 5, endOffset: 5, collapsed: true, isActive: true, segmentId: 'header', segmentPage: 0 }]);
    return { model, commands, injector };
}

describe('InsertHeaderFooterFieldCommand', () => {
    it('inserts a PAGE field into mixed text with style, snapshot round-trip and undo/redo', async () => {
        const { model, commands, injector } = createTestBed();
        const before = JSON.parse(JSON.stringify(model.getSnapshot()));
        expect(await commands.executeCommand(InsertHeaderFooterFieldCommand.id, { unitId: model.getUnitId(), fieldType: 'PAGE' })).toBe(true);
        injector.get(DocStateChangeManagerService).flushPendingChanges(model.getUnitId());
        const after = JSON.parse(JSON.stringify(model.getSnapshot()));
        const body = model.getSelfOrHeaderFooterModel('header')!.getBody()!;
        expect(body.dataStream).toBe(`Page ${DataStreamTreeTokenType.CUSTOM_RANGE_START}9${DataStreamTreeTokenType.CUSTOM_RANGE_END}\r\n`);
        expect(body.customRanges).toEqual([expect.objectContaining({ rangeType: CustomRangeType.FIELD, startIndex: 5, endIndex: 7, properties: { fieldType: 'PAGE', instruction: 'PAGE', cachedResult: '9', sourceKind: 'complex' } })]);
        expect(body.textRuns?.some((run) => run.st <= 6 && run.ed > 6 && run.ts?.bl === BooleanNumber.TRUE)).toBe(true);
        const restored = new DocumentDataModel(after);
        expect(restored.getSelfOrHeaderFooterModel('header')!.getBody()).toEqual(body);
        restored.dispose();
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(model.getSnapshot()).toEqual(before);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(model.getSnapshot()).toEqual(after);
    });

    it('uses the captured footer selection, supports fixed text and refuses stale or read-only insertion', async () => {
        const { model, commands, injector } = createTestBed();
        const target = { unitId: model.getUnitId(), segmentId: 'footer', selection: { startOffset: 0, endOffset: 0, collapsed: true }, fieldType: 'DATE', format: 'short', automatic: false, expectedDataStream: '\r\n' };
        expect(await commands.executeCommand(InsertHeaderFooterFieldCommand.id, target)).toBe(true);
        expect(model.getSelfOrHeaderFooterModel('footer')!.getBody()?.dataStream).toBe('09/29/2026\r\n');
        expect(model.getSelfOrHeaderFooterModel('footer')!.getBody()?.customRanges ?? []).toEqual([]);
        expect(await commands.executeCommand(InsertHeaderFooterFieldCommand.id, target)).toBe(false);
        setDocumentPermissionValue(injector.get(IPermissionService), model.getUnitId(), model.getUnitId(), UnitAction.Edit, false);
        expect(await commands.executeCommand(InsertHeaderFooterFieldCommand.id, { unitId: model.getUnitId(), fieldType: 'TIME' })).toBe(false);
    });
});
