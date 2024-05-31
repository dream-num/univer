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

import { Disposable, ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { IMenuItemFactory, MenuConfig } from '@univerjs/ui';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { ConfirmOperation } from '../commands/operations/confirm.operation';
import { DialogOperation } from '../commands/operations/dialog.operation';
import { LocaleOperation } from '../commands/operations/locale.operation';
import { MessageOperation } from '../commands/operations/message.operation';
import { NotificationOperation } from '../commands/operations/notification.operation';
import { SaveSnapshotOptions } from '../commands/operations/save-snapshot.operations';
import { SetEditable } from '../commands/operations/set.editable.operation';
import { SidebarOperation } from '../commands/operations/sidebar.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';
import { TestEditorContainer } from '../views/test-editor/TestTextEditor';
import { TEST_EDITOR_CONTAINER_COMPONENT } from '../views/test-editor/component-name';

// @ts-ignore
import VueI18nIcon from '../components/VueI18nIcon.vue';

import { CreateEmptySheetCommand, DisposeCurrentUnitCommand } from '../commands/commands/unit.command';
import { ChangeUserCommand } from '../commands/operations/change-user.operation';
import {
    ChangeUserMenuItemFactory,
    ConfirmMenuItemFactory,
    CreateEmptySheetMenuItemFactory,
    DialogMenuItemFactory,
    DisposeCurrentUnitMenuItemFactory,
    LocaleMenuItemFactory,
    MessageMenuItemFactory,
    NotificationMenuItemFactory,
    SaveSnapshotSetEditableMenuItemFactory,
    SetEditableMenuItemFactory,
    SidebarMenuItemFactory,
    ThemeMenuItemFactory,
    UnitMenuItemFactory,
} from './menu';
import { RecordController } from './local-save/record.controller';
import { ExportController } from './local-save/export.controller';

export interface IUniverDebuggerConfig {
    menu: MenuConfig;
}

export const DefaultDebuggerConfig = {};

export class DebuggerController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverDebuggerConfig>,
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();
        this._initializeContextMenu();

        this._initCustomComponents();

        [
            LocaleOperation,
            ThemeOperation,
            NotificationOperation,
            DialogOperation,
            ConfirmOperation,
            MessageOperation,
            SidebarOperation,
            SetEditable,
            SaveSnapshotOptions,
            DisposeCurrentUnitCommand,
            CreateEmptySheetCommand,
            ChangeUserCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));

        this._injector.add([ExportController]);
        this._injector.add([RecordController]);
    }

    private _initializeContextMenu() {
        const { menu = {} } = this._config;

        ([
            LocaleMenuItemFactory,
            ThemeMenuItemFactory,
            NotificationMenuItemFactory,
            MessageMenuItemFactory,
            DialogMenuItemFactory,
            ConfirmMenuItemFactory,
            SidebarMenuItemFactory,
            SetEditableMenuItemFactory,
            SaveSnapshotSetEditableMenuItemFactory,
            UnitMenuItemFactory,
            DisposeCurrentUnitMenuItemFactory,
            CreateEmptySheetMenuItemFactory,
            ChangeUserMenuItemFactory,
        ] as IMenuItemFactory[]).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), menu));
        });
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(TEST_EDITOR_CONTAINER_COMPONENT, TestEditorContainer));
        this.disposeWithMe(componentManager.register('VueI18nIcon', VueI18nIcon, {
            framework: 'vue3',
        }));
    }
}
