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

/**
 * @vitest-environment jsdom
 */

import type { IMenuManagerService, IMenuSchema } from '@univerjs/ui';
import type { Root } from 'react-dom/client';
import {
    ContextService,
    DocumentDataModel,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceService,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { RediContext, RibbonInsertGroup, RibbonStartGroup } from '@univerjs/ui';
import { act, createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EMPTY, Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { IEditorService } from '../../../services/editor/editor-manager.service';
import {
    getMobileDocMenuCommand,
    getMobileDocMenuSchemas,
    MobileDocEditDoneButton,
} from '../MobileDocToolbar';

class TestLogService {
    debug(): void {}
    warn(): void {}
}

class TestEditorService implements IEditorService {
    readonly blur$ = EMPTY;
    readonly focus$ = EMPTY;

    getEditor(): ReturnType<IEditorService['getEditor']> {
        return null;
    }

    register(): ReturnType<IEditorService['register']> {
        return { dispose: () => undefined };
    }

    getAllEditor(): ReturnType<IEditorService['getAllEditor']> {
        return new Map();
    }

    isEditor(): boolean {
        return false;
    }

    getEditorRenderConfig(): ReturnType<IEditorService['getEditorRenderConfig']> {
        return null;
    }

    isSheetEditor(): boolean {
        return false;
    }

    blur(): void {}
    focus(): void {}

    getFocusId(): ReturnType<IEditorService['getFocusId']> {
        return null;
    }

    getFocusEditor(): ReturnType<IEditorService['getFocusEditor']> {
        return null;
    }
}

class TestRenderManagerService implements IRenderManagerService {
    readonly created$ = EMPTY;
    readonly disposed$ = EMPTY;

    get defaultEngine(): IRenderManagerService['defaultEngine'] {
        throw new Error('Not used in this test');
    }

    addRender(): void {}

    createRender(): ReturnType<IRenderManagerService['createRender']> {
        throw new Error('Not used in this test');
    }

    removeRender(): void {}

    getRenderUnitById(): ReturnType<IRenderManagerService['getRenderUnitById']> {
        return null;
    }

    getAllRenderersOfType(): ReturnType<IRenderManagerService['getAllRenderersOfType']> {
        return [];
    }

    getRenderAll(): ReturnType<IRenderManagerService['getRenderAll']> {
        return new Map();
    }

    has(): boolean {
        return false;
    }

    registerRenderModule(): ReturnType<IRenderManagerService['registerRenderModule']> {
        return { dispose: () => undefined };
    }

    dispose(): void {}
}

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function createMenuManager(entries: Array<[string, IMenuSchema[]]>): IMenuManagerService {
    const schemas = new Map(entries);

    return {
        menuChanged$: new Subject<void>(),
        mergeMenu: () => undefined,
        appendRootMenu: () => undefined,
        getMenuByPositionKey: (position) => schemas.get(position) ?? [],
        getFlatMenuByPositionKey: (position) => schemas.get(position) ?? [],
    };
}

describe('getMobileDocMenuCommand', () => {
    it('uses an explicit command id and selected value', () => {
        expect(getMobileDocMenuCommand({
            id: 'menu-id',
            commandId: 'command-id',
            value: 'selected',
            params: { ignored: true },
        })).toEqual({
            commandId: 'command-id',
            params: { value: 'selected' },
        });
    });

    it('resolves command parameters when no selected value is present', () => {
        expect(getMobileDocMenuCommand({
            id: 'command-id',
            params: () => ({ enabled: true }),
        })).toEqual({
            commandId: 'command-id',
            params: { enabled: true },
        });
    });

    it('ignores options without a command', () => {
        expect(getMobileDocMenuCommand({})).toBeNull();
    });
});

describe('getMobileDocMenuSchemas', () => {
    it('adapts standard ribbon groups into mobile insert, format, and more surfaces', () => {
        const insertItem = { key: 'image', order: 0 };
        const formatDetail = { key: 'font', order: 0, gridLayout: { row: 1, column: 1 } };
        const formatQuick = { key: 'bold', order: 1, gridLayout: { row: 2, column: 1 } };
        const layoutItem = { key: 'align', order: 0, gridLayout: { row: 1, column: 1 } };
        const otherItem = { key: 'find', order: 0 };
        const insertOtherItem = { key: 'object-list', order: 0 };
        const menuManager = createMenuManager([
            [RibbonInsertGroup.MEDIA, [insertItem]],
            [RibbonStartGroup.FORMAT, [formatDetail, formatQuick]],
            [RibbonStartGroup.LAYOUT, [layoutItem]],
            [RibbonStartGroup.OTHERS, [otherItem]],
            [RibbonInsertGroup.OTHERS, [insertOtherItem]],
        ]);

        const schemas = getMobileDocMenuSchemas(menuManager);

        expect(schemas.insert[0].children).toEqual([insertItem]);
        expect(schemas.insert[0].quickLayout).toBe('tile');
        expect(schemas.format[0].children).toEqual([formatQuick]);
        expect(schemas.format[0].quickLayoutVariant).toBe('compact');
        expect(schemas.format[1].children).toEqual([formatDetail]);
        expect(schemas.more[0].children).toEqual([layoutItem, otherItem, insertOtherItem]);
        expect(schemas.more[0].quickLayout).toBe('tile');
    });
});

describe('MobileDocEditDoneButton', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    afterEach(() => {
        if (root) {
            act(() => root?.unmount());
        }
        container?.remove();
        root = undefined;
        container = undefined;
    });

    it('mounts in strict mode without resubscribing during render', () => {
        const injector = new Injector();
        injector.add([ILogService, { useClass: TestLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([LocaleService]);
        injector.add([IEditorService, { useClass: TestEditorService }]);
        injector.add([IRenderManagerService, { useClass: TestRenderManagerService }]);

        const doc = new DocumentDataModel({
            id: 'mobile-doc-toolbar-doc',
            body: {
                dataStream: '\r\n',
                paragraphs: [],
                sectionBreaks: [],
                customRanges: [],
                tables: [],
                textRuns: [],
            },
        });
        injector.get(IUniverInstanceService).__addUnit(doc);

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        act(() => {
            root?.render(createElement(
                StrictMode,
                null,
                createElement(
                    RediContext.Provider,
                    { value: { injector } },
                    createElement(MobileDocEditDoneButton)
                )
            ));
        });

        expect(container.innerHTML).toBe('');
    });
});
