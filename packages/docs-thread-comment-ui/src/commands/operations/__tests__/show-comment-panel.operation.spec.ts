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

import type { DocumentDataModel, IDisposable, IDocumentData } from '@univerjs/core';
import type { IRender } from '@univerjs/engine-render';
import type { ISidebarMethodOptions } from '@univerjs/ui';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { ISidebarService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_DOC_SUBUNIT_ID, DOCS_THREAD_COMMENT_PANEL } from '../../../common/const';
import { DocThreadCommentService } from '../../../services/doc-thread-comment.service';
import {
    ShowCommentPanelOperation,
    StartAddCommentOperation,
    ToggleCommentPanelOperation,
} from '../show-comment-panel.operation';

const unitId = 'doc-thread-comment-operation-doc';

function createDocData(): IDocumentData {
    return {
        id: unitId,
        body: {
            dataStream: 'Hello world\r\n',
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

class TestSidebarService extends Disposable implements ISidebarService {
    readonly sidebarOptions$ = new Subject<ISidebarMethodOptions>();
    readonly scrollEvent$ = new Subject<Event>();
    private _options: ISidebarMethodOptions = {};
    private _container?: HTMLElement;
    private _width?: number;

    get visible(): boolean {
        return this._options.visible ?? false;
    }

    get options(): ISidebarMethodOptions {
        return this._options;
    }

    get width(): number | undefined {
        return this._width;
    }

    open(params: ISidebarMethodOptions): IDisposable {
        this._options = { ...params, visible: true };
        this.sidebarOptions$.next(this._options);
        return toDisposable(() => this.close());
    }

    close(): void {
        this._options = { ...this._options, visible: false };
        this.sidebarOptions$.next(this._options);
        this._options.onClose?.();
    }

    getContainer(): HTMLElement | undefined {
        return this._container;
    }

    setContainer(element?: HTMLElement): void {
        this._container = element;
    }

    setWidth(value: number): void {
        this._width = value;
    }

    override dispose(): void {
        super.dispose();
        this.sidebarOptions$.complete();
        this.scrollEvent$.complete();
    }
}

class TestRenderManagerService implements Pick<IRenderManagerService, 'getRenderById'> {
    getRenderById(): IRender | null {
        return null;
    }
}

describe('doc thread comment panel operations', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let sidebarService: ISidebarService;
    let panelService: ThreadCommentPanelService;
    let selectionManager: DocSelectionManagerService;
    let docThreadCommentService: DocThreadCommentService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([ISidebarService, { useClass: TestSidebarService }]);
        injector.add([ThreadCommentPanelService]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocThreadCommentService]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);

        univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData());
        injector.get(IUniverInstanceService).focusUnit(unitId);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(ShowCommentPanelOperation);
        commandService.registerCommand(ToggleCommentPanelOperation);
        commandService.registerCommand(StartAddCommentOperation);

        sidebarService = injector.get(ISidebarService);
        panelService = injector.get(ThreadCommentPanelService);
        selectionManager = injector.get(DocSelectionManagerService);
        docThreadCommentService = injector.get(DocThreadCommentService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('opens the docs comment panel and activates the requested comment', async () => {
        const activeComment = { unitId, subUnitId: 'doc', commentId: 'comment-1' };

        const result = await commandService.executeCommand(ShowCommentPanelOperation.id, {
            activeComment,
        });

        expect(result).toBe(true);
        expect(panelService.panelVisible).toBe(true);
        expect(panelService.activeCommentId).toEqual(activeComment);
        expect(sidebarService.visible).toBe(true);
        expect(sidebarService.options.children?.label).toBe(DOCS_THREAD_COMMENT_PANEL);
    });

    it('toggles an open comment panel closed and clears the active comment', async () => {
        const activeComment = { unitId, subUnitId: 'doc', commentId: 'comment-2' };

        await commandService.executeCommand(ShowCommentPanelOperation.id, {
            activeComment,
        });
        const result = await commandService.executeCommand(ToggleCommentPanelOperation.id);

        expect(result).toBe(true);
        expect(panelService.panelVisible).toBe(false);
        expect(panelService.activeCommentId).toBeNull();
        expect(sidebarService.visible).toBe(false);
    });

    it('starts a new comment draft from the selected document text', async () => {
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId,
            subUnitId: unitId,
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 5,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        const result = await commandService.executeCommand(StartAddCommentOperation.id);

        expect(result).toBe(true);
        expect(panelService.panelVisible).toBe(true);
        expect(docThreadCommentService.addingComment).toMatchObject({
            unitId,
            ref: 'Hello',
            startOffset: 0,
            endOffset: 5,
            collapsed: true,
        });
        expect(panelService.activeCommentId).toEqual({
            unitId,
            subUnitId: DEFAULT_DOC_SUBUNIT_ID,
            commentId: '',
        });
    });

    it('does not start a new comment draft without selected document text', async () => {
        const result = await commandService.executeCommand(StartAddCommentOperation.id);

        expect(result).toBe(false);
        expect(docThreadCommentService.addingComment).toBeUndefined();
        expect(panelService.panelVisible).toBe(false);
    });
});
