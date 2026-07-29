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

import type { DocumentDataModel, Injector } from '@univerjs/core';
import type { IRenderContext, IRichTextProps } from '@univerjs/engine-render';
import type { ISlideData } from '@univerjs/slides';
import {
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    DocStateEmitService,
    RichTextEditingMutation,
} from '@univerjs/docs';
import { EditorService, IEditorService, ReplaceSnapshotCommand } from '@univerjs/docs-ui';
import { IRenderManagerService, RichText } from '@univerjs/engine-render';
import { SlideDataModel } from '@univerjs/slides';
import { DesktopLayoutService, ILayoutService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SLIDE_EDITOR_ID } from '../../const';
import { ISlideEditorBridgeService, SlideEditorBridgeService } from '../../services/slide-editor-bridge.service';
import { ISlideEditorManagerService, SlideEditorManagerService } from '../../services/slide-editor-manager.service';
import { SlideEditingRenderController } from '../slide-editing.render-controller';

const unitId = 'slide-unit';

function createSlideSnapshot(): Partial<ISlideData> {
    return {
        id: unitId,
        title: 'Editor test deck',
        pageSize: { width: 960, height: 540 },
        body: {
            pageOrder: [],
            pages: {},
        },
    };
}

function createRichText(injector: Injector, id: string, text: string, top: number): RichText {
    const props: IRichTextProps = {
        text,
        zIndex: 1,
        left: 10,
        top,
        width: 200,
        height: 40,
    };

    return injector.createInstance(RichText, injector.get(LocaleService), id, props);
}

describe('SlideEditingRenderController', () => {
    let univer: Univer;
    let controller: SlideEditingRenderController;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        const renderManagerService = {
            getRenderUnitById: () => null,
        } as unknown as IRenderManagerService;

        injector.add([IRenderManagerService, { useValue: renderManagerService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
        injector.add([ISlideEditorBridgeService, { useClass: SlideEditorBridgeService }]);
        injector.add([ISlideEditorManagerService, { useClass: SlideEditorManagerService }]);

        const instanceService = injector.get(IUniverInstanceService);
        instanceService.registerCtorForType(UniverInstanceType.UNIVER_SLIDE, SlideDataModel);
        const commandService = injector.get(ICommandService);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(ReplaceSnapshotCommand);

        const slide = univer.createUnit<ISlideData, SlideDataModel>(UniverInstanceType.UNIVER_SLIDE, createSlideSnapshot());
        controller = injector.createInstance(SlideEditingRenderController, {
            unitId,
            unit: slide,
        } as IRenderContext<SlideDataModel>);
    });

    afterEach(() => {
        controller?.dispose();
        univer.dispose();
    });

    it('keeps the registered editor unit while replacing its snapshot', () => {
        const injector = univer.__getInjector();
        const instanceService = injector.get(IUniverInstanceService);
        const editorBridgeService = injector.get(ISlideEditorBridgeService);
        const firstText = createRichText(injector, 'first', 'First text', 20);
        const secondText = createRichText(injector, 'second', 'Second text', 80);

        editorBridgeService.setEditorRect({
            scene: null as never,
            engine: null as never,
            unitId,
            pageId: 'page-1',
            richTextObj: firstText,
        });

        const editorDocument = instanceService.getUnit<DocumentDataModel>(SLIDE_EDITOR_ID, UniverInstanceType.UNIVER_DOC);
        expect(editorDocument?.getBody()?.dataStream).toBe('First text\r\n');

        editorBridgeService.setEditorRect({
            scene: null as never,
            engine: null as never,
            unitId,
            pageId: 'page-1',
            richTextObj: secondText,
        });

        expect(instanceService.getUnit(SLIDE_EDITOR_ID, UniverInstanceType.UNIVER_DOC)).toBe(editorDocument);
        expect(editorDocument?.getBody()?.dataStream).toBe('Second text\r\n');
        expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC)).toBe(editorDocument);

        firstText.dispose();
        secondText.dispose();
    });
});
