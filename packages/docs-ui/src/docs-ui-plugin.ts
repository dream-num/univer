/**
 * Copyright 2023-present DreamNum Inc.
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
    ILogService,
    IUniverInstanceService,
    LocaleService,
    Plugin,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { IEditorService, IShortcutService } from '@univerjs/ui';

import {
    MoveCursorDownShortcut,
    MoveCursorLeftShortcut,
    MoveCursorRightShortcut,
    MoveCursorUpShortcut,
    MoveSelectionDownShortcut,
    MoveSelectionLeftShortcut,
    MoveSelectionRightShortcut,
    MoveSelectionUpShortcut,
    SelectAllShortcut,
} from './shortcuts/cursor.shortcut';
import type { IUniverDocsUIConfig } from './basics';
import { DefaultDocUiConfig } from './basics';
import { DOC_UI_PLUGIN_NAME } from './basics/const/plugin-name';
import { AppUIController } from './controllers';
import { DocUIController } from './controllers/doc-ui.controller';

import { BreakLineShortcut, DeleteLeftShortcut, DeleteRightShortcut } from './shortcuts/core-editing.shortcut';
import { DocClipboardService, IDocClipboardService } from './services/clipboard/clipboard.service';
import { DocClipboardController } from './controllers/clipboard.controller';
import { DocEditorBridgeController } from './controllers/doc-editor-bridge.controller';
import { DocRenderController } from './controllers/doc-render.controller';
import { DocCanvasView } from './views/doc-canvas-view';
import { DocFloatingObjectController } from './controllers/doc-floating-object.controller';
import { ZoomController } from './controllers/zoom.controller';
import { TextSelectionController } from './controllers/text-selection.controller';
import { BackScrollController } from './controllers/back-scroll.controller';
import { DocCanvasPopManagerService } from './services/doc-popup-manager.service';

export class UniverDocsUIPlugin extends Plugin {
    static override pluginName = DOC_UI_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: IUniverDocsUIConfig,
        @Inject(Injector) override _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ILogService private _logService: ILogService
    ) {
        super();

        this._config = Tools.deepMerge({}, DefaultDocUiConfig, this._config);
        this._initDependencies(_injector);
        this._initializeCommands();
    }

    override onRendered(): void {
        this._initModules();
        this._markDocAsFocused();
    }

    private _initializeCommands(): void {
        [
            MoveCursorUpShortcut,
            MoveCursorDownShortcut,
            MoveCursorRightShortcut,
            MoveCursorLeftShortcut,
            MoveSelectionUpShortcut,
            MoveSelectionDownShortcut,
            MoveSelectionLeftShortcut,
            MoveSelectionRightShortcut,
            SelectAllShortcut,
            DeleteLeftShortcut,
            DeleteRightShortcut,
            BreakLineShortcut,
        ].forEach((shortcut) => {
            this._injector.get(IShortcutService).registerShortcut(shortcut);
        });
    }

    private _initDependencies(injector: Injector) {
        const dependencies: Dependency[] = [
            // Controller
            [
                DocUIController,
                {
                    useFactory: () => this._injector.createInstance(DocUIController, this._config),
                },
            ],
            [DocClipboardController],
            [DocEditorBridgeController],
            [DocRenderController],
            [DocFloatingObjectController],
            [ZoomController],
            [TextSelectionController],
            [BackScrollController],
            [
                // controllers
                AppUIController,
                {
                    useFactory: () => this._injector.createInstance(AppUIController, this._config),
                },
            ],
            [
                IDocClipboardService,
                {
                    useClass: DocClipboardService,
                },
            ],
            [DocCanvasPopManagerService],

            // Render views
            [DocCanvasView],
        ];

        dependencies.forEach((d) => {
            injector.add(d);
        });
    }

    private _markDocAsFocused() {
        const currentService = this._injector.get(IUniverInstanceService);
        const editorService = this._injector.get(IEditorService);
        try {
            const doc = currentService.getCurrentUniverDocInstance();
            if (!doc) return;

            const id = doc.getUnitId();
            if (!editorService.isEditor(id)) {
                currentService.focusUnit(doc.getUnitId());
            }
        } catch (err) {
            this._logService.warn(err);
        }
    }

    private _initModules(): void {
        this._injector.get(AppUIController);
    }
}
