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

import { Disposable, ICommandService, ISnapshotPersistenceService, IUniverInstanceService } from '@univerjs/core';
import { IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { ExportController, LocalSnapshotService, RecordController } from '../../local-save';
import { ConfirmOperation } from '../commands/operations/confirm.operation';
import { DialogOperation } from '../commands/operations/dialog.operation';
import { LocaleOperation } from '../commands/operations/locale.operation';
import { MessageOperation } from '../commands/operations/message.operation';
import { NotificationOperation } from '../commands/operations/notification.operation';
import { SaveSnapshotOptions } from '../commands/operations/save-snapshot.operations';
import { SetEditable } from '../commands/operations/set.editable.operation';
import { SidebarOperation } from '../commands/operations/sidebar.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';
import {
    ConfirmMenuItemFactory,
    DialogMenuItemFactory,
    LocaleMenuItemFactory,
    MessageMenuItemFactory,
    NotificationMenuItemFactory,
    SaveSnapshotSetEditableMenuItemFactory,
    SetEditableMenuItemFactory,
    SidebarMenuItemFactory,
    ThemeMenuItemFactory,
} from './menu';

export class DebuggerController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initializeContextMenu();

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
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));

        this._injector.add([ISnapshotPersistenceService, { useClass: LocalSnapshotService }]);
        this._injector.add([ExportController]);
        this._injector.add([RecordController]);
    }

    private _initializeContextMenu() {
        [
            LocaleMenuItemFactory,
            ThemeMenuItemFactory,
            NotificationMenuItemFactory,
            MessageMenuItemFactory,
            DialogMenuItemFactory,
            ConfirmMenuItemFactory,
            SidebarMenuItemFactory,
            SetEditableMenuItemFactory,
            SaveSnapshotSetEditableMenuItemFactory,
        ].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
