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

import { Disposable, ICommandService, Inject, Injector } from '@univerjs/core';
import { ComponentManager, IMenuManagerService } from '@univerjs/ui';
import { CreateFloatDomCommand } from '../commands/commands/float-dom.command';
import { CreateEmptySheetCommand, DisposeCurrentUnitCommand, DisposeUniverCommand, LoadSheetSnapshotCommand } from '../commands/commands/unit.command';
import { ShowCellContentOperation } from '../commands/operations/cell.operation';
import { ChangeUserCommand } from '../commands/operations/change-user.operation';
import { ConfirmOperation } from '../commands/operations/confirm.operation';
import { DarkModeOperation } from '../commands/operations/dark-mode.operation';
import { DialogOperation } from '../commands/operations/dialog.operation';
import { LocaleOperation } from '../commands/operations/locale.operation';
import { MessageOperation } from '../commands/operations/message.operation';
import { NotificationOperation } from '../commands/operations/notification.operation';
import { OpenWatermarkPanelOperation } from '../commands/operations/open-watermark-panel.operation';
import { SaveSnapshotOptions } from '../commands/operations/save-snapshot.operations';
import { SetEditable } from '../commands/operations/set.editable.operation';
import { SidebarOperation } from '../commands/operations/sidebar.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';
import { AIButton, FloatButton } from '../components/FloatButton';
import { ImageDemo } from '../components/Image';
import { RangeLoading } from '../components/RangeLoading';
// @ts-ignore
import VueI18nIcon from '../components/VueI18nIcon.vue';
import { RecordController } from './local-save/record.controller';
import { menuSchema } from './menu.schema';

export class DebuggerController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initializeMenu();
        this._initCustomComponents();

        [
            LocaleOperation,
            DarkModeOperation,
            ThemeOperation,
            NotificationOperation,
            DialogOperation,
            ConfirmOperation,
            MessageOperation,
            SidebarOperation,
            SetEditable,
            SaveSnapshotOptions,
            DisposeUniverCommand,
            DisposeCurrentUnitCommand,
            CreateEmptySheetCommand,
            LoadSheetSnapshotCommand,
            CreateFloatDomCommand,
            ChangeUserCommand,
            ShowCellContentOperation,
            OpenWatermarkPanelOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));

        this._injector.add([RecordController]);
    }

    private _initializeMenu() {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register('VueI18nIcon', VueI18nIcon, {
            framework: 'vue3',
        }));
        this.disposeWithMe(componentManager.register('ImageDemo', ImageDemo));
        this.disposeWithMe(componentManager.register('RangeLoading', RangeLoading));
        this.disposeWithMe(componentManager.register('FloatButton', FloatButton));
        this.disposeWithMe(componentManager.register('AIButton', AIButton));
    }
}
