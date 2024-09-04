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

import type {
    Dependency } from '@univerjs/core';
import { ICommandService,

    IConfigService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    mergeOverrideWithDependencies,
    Plugin, UniverInstanceType } from '@univerjs/core';
import { IEditorService, IShortcutService } from '@univerjs/ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DocInterceptorService, DocSkeletonManagerService } from '@univerjs/docs';
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
import { DOC_UI_PLUGIN_NAME } from './basics/const/plugin-name';
import { AppUIController } from './controllers';
import { DocUIController } from './controllers/doc-ui.controller';
import { BreakLineShortcut, DeleteLeftShortcut, DeleteRightShortcut } from './shortcuts/core-editing.shortcut';
import { DocClipboardService, IDocClipboardService } from './services/clipboard/clipboard.service';
import { DocClipboardController } from './controllers/clipboard.controller';
import { DocEditorBridgeController } from './controllers/doc-editor-bridge.controller';
import { DocRenderController } from './controllers/render-controllers/doc.render-controller';
import { DocZoomRenderController } from './controllers/render-controllers/zoom.render-controller';
import { DocTextSelectionRenderController } from './controllers/render-controllers/text-selection.render-controller';
import { DocBackScrollRenderController } from './controllers/render-controllers/back-scroll.render-controller';
import { DocCanvasPopManagerService } from './services/doc-popup-manager.service';
import { DocsRenderService } from './services/docs-render.service';
import { DocHeaderFooterController } from './controllers/doc-header-footer.controller';
import { DocContextMenuRenderController } from './controllers/render-controllers/contextmenu.render-controller';
import { DocPageLayoutService } from './services/doc-page-layout.service';
import { DocResizeRenderController } from './controllers/render-controllers/doc-resize.render-controller';
import { DocEventManagerService } from './services/doc-event-manager.service';
import { DocAutoFormatController } from './controllers/doc-auto-format.controller';
import { ShiftTabShortCut } from './shortcuts/format.shortcut';
import { DocChecklistRenderController } from './controllers/render-controllers/doc-checklist.render-controller';
import { DocParagraphSettingController } from './controllers/doc-paragraph-setting.controller';

import { DocParagraphSettingPanelOperation } from './commands/operations/doc-paragraph-setting-panel.operation';
import { DocParagraphSettingCommand } from './commands/commands/doc-paragraph-setting.command';
import { DocTableController } from './controllers/doc-table.controller';
import type { IUniverDocsUIConfig } from './controllers/config.schema';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';

export class UniverDocsUIPlugin extends Plugin {
    static override pluginName = DOC_UI_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: Partial<IUniverDocsUIConfig> = defaultPluginConfig,
        @Inject(Injector) override _injector: Injector,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService,
        @ICommandService private _commandService: ICommandService,
        @ILogService private _logService: ILogService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = this._config;
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);

        this._initDependencies(_injector);
        this._initializeShortcut();
        this._initCommand();
    }

    override onReady(): void {
        this._initRenderBasics();
        this._markDocAsFocused();
    }

    override onRendered(): void {
        this._initUI();
        this._initRenderModules();
    }

    private _initCommand() {
        [DocParagraphSettingCommand, DocParagraphSettingPanelOperation].forEach((e) => {
            this._commandService.registerCommand(e);
        });
    }

    private _initializeShortcut(): void {
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
            ShiftTabShortCut,
            // TabShortcut,
            // ShiftTabShortcut,
        ].forEach((shortcut) => {
            this._injector.get(IShortcutService).registerShortcut(shortcut);
        });
    }

    private _initDependencies(injector: Injector) {
        const dependencies: Dependency[] = [
            [DocUIController],
            [DocClipboardController],
            [DocEditorBridgeController],
            [DocAutoFormatController],

            [DocTableController],
            [DocsRenderService],
            [AppUIController],
            [IDocClipboardService, { useClass: DocClipboardService }],
            [DocCanvasPopManagerService],
            [DocParagraphSettingController],
        ];

        const dependency = mergeOverrideWithDependencies(dependencies, this._config.override);

        dependency.forEach((d) => injector.add(d));
    }

    private _markDocAsFocused() {
        const currentService = this._injector.get(IUniverInstanceService);
        const editorService = this._injector.get(IEditorService);
        try {
            const doc = currentService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC);
            if (!doc) return;

            const id = doc.getUnitId();
            if (!editorService.isEditor(id)) {
                currentService.focusUnit(doc.getUnitId());
            }
        } catch (err) {
            this._logService.warn(err);
        }
    }

    private _initUI(): void {
        this._injector.get(AppUIController);
    }

    private _initRenderBasics(): void {
        ([
            [DocSkeletonManagerService],
            [DocInterceptorService],
            [DocPageLayoutService],
            [DocRenderController],
            [DocZoomRenderController],
        ] as Dependency[]).forEach((m) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, m);
        });
    }

    private _initRenderModules(): void {
        ([
            [DocEventManagerService],
            [DocBackScrollRenderController],
            [DocTextSelectionRenderController],
            [DocHeaderFooterController],
            [DocResizeRenderController],
            [DocContextMenuRenderController],
            [DocChecklistRenderController],
        ] as Dependency[]).forEach((m) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, m);
        });
    }
}
