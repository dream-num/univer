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

import type { DocumentDataModel, IDisposable, IDocumentBody, IDocumentData, Injector } from '@univerjs/core';
import type { IRender } from '@univerjs/engine-render';
import type { IThreadComment } from '@univerjs/thread-comment';
import type { ISidebarMethodOptions } from '@univerjs/ui';
import type { Root } from 'react-dom/client';
import {
    CustomDecorationType,
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    toDisposable,
    Univer,
    UniverInstanceType,
    UserManagerService,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IThreadCommentDataSourceService, ThreadCommentDataSourceService, ThreadCommentModel } from '@univerjs/thread-comment';
import { SetActiveCommentOperation, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import threadCommentEnUS from '@univerjs/thread-comment-ui/locale/en-US';
import { ISidebarService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../common/const';
import { DocThreadCommentService } from '../../services/doc-thread-comment.service';
import { DocThreadCommentPanel } from '../DocThreadCommentPanel';

const DOC_ID = 'doc-thread-comment-panel-test';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestSidebarService extends Disposable implements ISidebarService {
    readonly sidebarOptions$ = new Subject<ISidebarMethodOptions>();
    readonly scrollEvent$ = new Subject<Event>();
    private _options: ISidebarMethodOptions = {};
    private _container?: HTMLElement;

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

    get visible(): boolean {
        return this._options.visible ?? false;
    }

    get options(): ISidebarMethodOptions {
        return this._options;
    }

    get width(): number | undefined {
        return undefined;
    }

    setWidth(): void {}

    getContainer(): HTMLElement | undefined {
        return this._container;
    }

    setContainer(element?: HTMLElement): void {
        this._container = element;
    }

    override dispose(): void {
        super.dispose();
        this.sidebarOptions$.complete();
        this.scrollEvent$.complete();
    }
}

class TestRenderManagerService implements Pick<IRenderManagerService, 'getRenderById' | 'getRenderUnitById'> {
    getRenderById(): IRender | null {
        return null;
    }

    getRenderUnitById(): IRender | null {
        return null;
    }
}

function createDocData(decorationIds: string[]): IDocumentData {
    return {
        id: DOC_ID,
        body: {
            dataStream: 'Alpha beta gamma\r\n',
            textRuns: [],
            paragraphs: [],
            sectionBreaks: [],
            customBlocks: [],
            customDecorations: decorationIds.map((id) => ({
                id,
                type: CustomDecorationType.COMMENT,
                startIndex: 0,
                endIndex: 4,
            })),
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

function createTextBody(text: string): IDocumentBody {
    const dataStream = `${text}\r\n`;
    return {
        dataStream,
        textRuns: [],
        paragraphs: [
            {
                startIndex: dataStream.length - 2,
                paragraphId: `paragraph-${text}`,
            },
        ],
        sectionBreaks: [
            {
                sectionId: `section-${text}`,
                startIndex: dataStream.length - 1,
            },
        ],
    };
}

function createThread(id: string, text: string, resolved = false): IThreadComment {
    return {
        id,
        threadId: id,
        ref: `Range ${id}`,
        unitId: DOC_ID,
        subUnitId: DEFAULT_DOC_SUBUNIT_ID,
        dT: '2026-06-17T00:00:00.000Z',
        personId: 'user-1',
        resolved,
        text: createTextBody(text),
    };
}

function createPanelTestBed(decorationIds: string[]) {
    const univer = new Univer({
        locale: LocaleType.EN_US,
        locales: {
            [LocaleType.EN_US]: threadCommentEnUS,
        },
    });
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector) as Injector['get'];

    injector.add([DocSelectionManagerService]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }]);
    injector.add([ThreadCommentModel]);
    injector.add([ISidebarService, { useClass: TestSidebarService as never }]);
    injector.add([ThreadCommentPanelService]);
    injector.add([DocThreadCommentService]);

    univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocData(decorationIds));
    get(IUniverInstanceService).focusUnit(DOC_ID);
    get(UserManagerService).setCurrentUser({ userID: 'user-1', name: 'Ada' });
    get(ICommandService).registerCommand(SetActiveCommentOperation);

    return {
        univer,
        injector,
        get,
        threadCommentModel: get(ThreadCommentModel),
        panelService: get(ThreadCommentPanelService),
    };
}

function renderPanel(injector: Injector) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <DocThreadCommentPanel />
            </RediContext.Provider>
        );
    });

    return { container, root };
}

describe('DocThreadCommentPanel', () => {
    let univer: Univer | undefined;
    let root: Root | undefined;
    let container: HTMLElement | undefined;
    let scrollIntoViewDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
        Object.defineProperty(Element.prototype, 'scrollIntoView', {
            configurable: true,
            value() {},
        });
    });

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        univer?.dispose();
        if (scrollIntoViewDescriptor) {
            Object.defineProperty(Element.prototype, 'scrollIntoView', scrollIntoViewDescriptor);
        } else {
            delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
        }
        root = undefined;
        container = undefined;
        univer = undefined;
    });

    it('renders only thread comments attached to document custom ranges', () => {
        const testBed = createPanelTestBed(['visible-thread', 'visible-thread']);
        univer = testBed.univer;
        testBed.threadCommentModel.addComment(DOC_ID, DEFAULT_DOC_SUBUNIT_ID, createThread('visible-thread', 'Visible document feedback'));
        testBed.threadCommentModel.addComment(DOC_ID, DEFAULT_DOC_SUBUNIT_ID, createThread('detached-thread', 'Detached feedback'));

        const rendered = renderPanel(testBed.injector);
        root = rendered.root;
        container = rendered.container;

        expect(container.textContent).toContain('Visible document feedback');
        expect(container.textContent).not.toContain('Detached feedback');
        expect(container.textContent?.match(/Visible document feedback/g)).toHaveLength(1);
    });
});
