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

import type { Root } from 'react-dom/client';
import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    Disposable,
    DocumentDataModel,
    HorizontalAlign,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LocalUndoRedoService,
    RichTextBuilder,
    ThemeService,
    Tools,
    UniverInstanceService,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    DocSkeletonManagerService,
    DocStateEmitService,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    IPlatformService,
    IShortcutService,
    IUIRuntimeScopeService,
    PlatformService,
    RediContext,
    ShortcutService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReplaceSnapshotCommand } from '../../commands/commands/replace-content.command';
import { EditorService, IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
import { RichTextEditor } from '../RichTextEditor';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Canvas layout is the platform boundary; editor state and commands use their real providers.
class TestEditorRender extends Disposable {
    readonly selection = {
        onBlur$: new Subject(),
        onFocus$: new Subject(),
        onPaste$: new Subject(),
        onInput$: new Subject(),
        onKeydown$: new Subject(),
        onCompositionupdate$: new Subject(),
        onCompositionend$: new Subject(),
        textSelectionInner$: new Subject(),
        isFocusing: false,
    };

    readonly components = new Map();
    readonly canvas = document.createElement('canvas');
    readonly engine = {
        canvasColorService: {},
        mount: (container: HTMLDivElement) => container.appendChild(this.canvas),
        getCanvas: () => ({ getCanvasEle: () => this.canvas }),
    };

    with(token: unknown) {
        if (token === DocSelectionRenderService) {
            return this.selection;
        }
        if (token === DocSkeletonManagerService) {
            return {
                getViewModel: () => undefined,
                getSkeleton: () => ({ getActualSize: () => ({ actualWidth: 100, actualHeight: 20 }) }),
            };
        }
        throw new Error(`Unexpected render service: ${String(token)}`);
    }

    override dispose() {
        Object.values(this.selection).forEach((value) => {
            if (value instanceof Subject) {
                value.complete();
            }
        });
        this.canvas.remove();
        super.dispose();
    }
}

class TestRenderManagerService extends Disposable {
    private readonly _renders = new Map<string, TestEditorRender>();

    createRender(id: string) {
        const render = new TestEditorRender();
        this._renders.set(id, render);
        this.disposeWithMe(render);
        return render;
    }

    getRenderUnitById(id: string) {
        return this._renders.get(id);
    }

    removeRender(id: string) {
        this._renders.get(id)?.dispose();
        this._renders.delete(id);
    }

    override dispose() {
        this._renders.clear();
        super.dispose();
    }
}

function createEditorTestBed() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
    injector.add([LocaleService]);
    injector.add([ThemeService]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([IEditorService, { useClass: EditorService }]);
    injector.add([IPlatformService, { useClass: PlatformService }]);
    injector.add([IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }]);
    injector.add([IShortcutService, { useClass: ShortcutService }]);
    const commandService = injector.get(ICommandService);
    commandService.registerCommand(ReplaceSnapshotCommand);
    commandService.registerCommand(RichTextEditingMutation);
    commandService.registerCommand(SetTextSelectionsOperation);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: {} });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');
    const initialSnapshot = {
        ...RichTextBuilder.create().insertText('A1:B2').getData(),
        id: 'rich-text-editor-test',
    };
    const model = new DocumentDataModel(Tools.deepClone(initialSnapshot));
    (injector.get(IUniverInstanceService) as UniverInstanceService).__addUnit(model);
    return { injector, localeService, model, initialSnapshot };
}

describe('RichTextEditor alignment', () => {
    let container: HTMLDivElement;
    let root: Root;
    let testBed: ReturnType<typeof createEditorTestBed>;

    beforeEach(() => {
        vi.useFakeTimers();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        testBed = createEditorTestBed();
    });

    afterEach(() => {
        act(() => root.unmount());
        testBed.injector.dispose();
        container.remove();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    function renderEditor(isSingle: boolean) {
        act(() => {
            root.render(
                <RediContext.Provider value={{ injector: testBed.injector }}>
                    <RichTextEditor
                        editorId={testBed.model.getUnitId()}
                        initialValue={testBed.initialSnapshot}
                        isSingle={isSingle}
                    />
                </RediContext.Provider>
            );
        });
    }

    it.each([['ltr', HorizontalAlign.LEFT], ['rtl', HorizontalAlign.RIGHT]] as const)(
        'aligns the document for initial %s direction without changing its input',
        (direction, alignment) => {
            const { localeService, model, initialSnapshot } = testBed;
            localeService.setDirection(direction);
            const original = Tools.deepClone(initialSnapshot);
            renderEditor(true);
            expect(model.getSnapshot().documentStyle?.renderConfig?.horizontalAlign).toBe(alignment);
            expect(model.getPlainText()).toBe('A1:B2');
            expect(initialSnapshot).toEqual(original);
        }
    );

    it.each([true, false])('updates mounted alignment through commands and retains selection (isSingle=%s)', (isSingle) => {
        const { injector, localeService, model } = testBed;
        renderEditor(isSingle);
        const editor = injector.get(IEditorService).getEditor(model.getUnitId())!;
        const selections = [{ startOffset: 1, endOffset: 3, collapsed: false, isActive: true, segmentId: '' }];
        const selectionManager = injector.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: editor.getEditorId(), subUnitId: editor.getEditorId() });
        selectionManager.__TEST_ONLY_add(selections);
        const previous = Tools.deepClone(model.getSnapshot());
        const beforeCommand = injector.get(ICommandService).beforeCommandExecuted((command) => {
            if (command.id === ReplaceSnapshotCommand.id) {
                // The builder must not mutate live document state before its command executes.
                expect(model.getSnapshot()).toEqual(previous);
                expect(command.params).toMatchObject({ textRanges: selections });
            }
        });
        act(() => localeService.setDirection('rtl'));
        beforeCommand.dispose();
        expect(model.getSnapshot().documentStyle?.renderConfig?.horizontalAlign).toBe(HorizontalAlign.RIGHT);
        expect(editor.getSelectionRanges()).toEqual(selections);
        act(() => localeService.setDirection('ltr'));
        expect(model.getSnapshot().documentStyle?.renderConfig?.horizontalAlign).toBe(HorizontalAlign.LEFT);
        expect(editor.getSelectionRanges()).toEqual(selections);
        expect(model.getPlainText()).toBe('A1:B2');
    });
});
