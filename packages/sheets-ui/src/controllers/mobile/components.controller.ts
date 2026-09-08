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

import type { IUniverSheetsUIConfig } from '../../config/config';
import { Disposable, IConfigService, Inject, Injector } from '@univerjs/core';
import { ComponentManager, IconManager } from '@univerjs/ui';
import { EMBEDDING_CELL_EDITOR_COMPONENT_KEY } from '../../common/keys';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../config/config';
import {
    UNIVER_SHEET_PERMISSION_DIALOG,
    UNIVER_SHEET_PERMISSION_PANEL,
    UNIVER_SHEET_PERMISSION_USER_DIALOG,
    UNIVER_SHEET_PERMISSION_USER_PART,
} from '../../consts/permission';
import { BORDER_PANEL_COMPONENT } from '../../views/border-panel/interface';
import { CELL_ALERT_KEY } from '../../views/cell-alert';
import { CELL_POPUP_COMPONENT_KEY } from '../../views/cell-popup/config';
import { CellPopup } from '../../views/CellPopup';
import { DEFINED_NAME_CONTAINER } from '../../views/defined-name/component-name';
import { CascaderDropdown } from '../../views/dropdown/CascaderDropdown';
import { DateDropdown } from '../../views/dropdown/DateDropdown';
import { ListDropDown } from '../../views/dropdown/ListDropDown';
import { MENU_ITEM_FROZEN_COMPONENT, MenuItemFrozen } from '../../views/menu-item-frozen';
import { MENU_ITEM_INPUT_COMPONENT } from '../../views/menu-item-input';
import { MobileBorderPanel } from '../../views/mobile/border-panel/MobileBorderPanel';
import { MobileCellAlert } from '../../views/mobile/cell-alert/MobileCellAlert';
import { MobileDefinedNameContainer } from '../../views/mobile/defined-name/MobileDefinedNameContainer';
import { MobileColorDropdown } from '../../views/mobile/dropdown/MobileColorDropdown';
import { MobileEditorContainer } from '../../views/mobile/editor-container/MobileEditorContainer';
import { MobileMenuItemInput } from '../../views/mobile/menu-item-input/MobileMenuItemInput';
import { MobileSheetPermissionDialog } from '../../views/mobile/permission/MobileSheetPermissionDialog';
import { MobileSheetPermissionPanel } from '../../views/mobile/permission/MobileSheetPermissionPanel';
import { MobileSheetPermissionUserDialog } from '../../views/mobile/permission/MobileSheetPermissionUserDialog';
import { AlertDialog } from '../../views/permission/AlertDialog';
import { UNIVER_SHEET_PERMISSION_ALERT_DIALOG } from '../../views/permission/error-msg-dialog/interface';
import { SHEET_ZOOM_INPUT_COMPONENT, SheetZoomInput } from '../../views/sheet-slider/SheetZoomInput';
import { sheetsUIIcons } from '../sheets-ui-icons';

export class MobileComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) componentManager: ComponentManager,
        @Inject(IconManager) iconManager: IconManager,
        @Inject(Injector) injector: Injector
    ) {
        super();

        this.disposeWithMe(componentManager.register(
            EMBEDDING_CELL_EDITOR_COMPONENT_KEY,
            MobileEditorContainer
        ));
        this.disposeWithMe(componentManager.register(CELL_ALERT_KEY, MobileCellAlert));
        this.disposeWithMe(componentManager.register(MobileColorDropdown.componentKey, MobileColorDropdown));
        this.disposeWithMe(componentManager.register(DateDropdown.componentKey, DateDropdown));
        this.disposeWithMe(componentManager.register(ListDropDown.componentKey, ListDropDown));
        this.disposeWithMe(componentManager.register(CascaderDropdown.componentKey, CascaderDropdown));
        this.disposeWithMe(componentManager.register(MENU_ITEM_INPUT_COMPONENT, MobileMenuItemInput));
        this.disposeWithMe(componentManager.register(MENU_ITEM_FROZEN_COMPONENT, MenuItemFrozen));
        this.disposeWithMe(componentManager.register(SHEET_ZOOM_INPUT_COMPONENT, SheetZoomInput));
        this.disposeWithMe(componentManager.register(BORDER_PANEL_COMPONENT, MobileBorderPanel));
        this.disposeWithMe(componentManager.register(DEFINED_NAME_CONTAINER, MobileDefinedNameContainer));
        this.disposeWithMe(componentManager.register(CELL_POPUP_COMPONENT_KEY, CellPopup));
        this.disposeWithMe(componentManager.register(UNIVER_SHEET_PERMISSION_PANEL, MobileSheetPermissionPanel));
        this.disposeWithMe(componentManager.register(UNIVER_SHEET_PERMISSION_DIALOG, MobileSheetPermissionDialog));
        this.disposeWithMe(componentManager.register(
            UNIVER_SHEET_PERMISSION_USER_DIALOG,
            MobileSheetPermissionUserDialog
        ));
        this.disposeWithMe(componentManager.register(UNIVER_SHEET_PERMISSION_ALERT_DIALOG, AlertDialog));

        const config = injector.get(IConfigService).getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
        if (config?.protectedRangeUserSelector) {
            const { component, framework } = config.protectedRangeUserSelector;
            this.disposeWithMe(componentManager.register(UNIVER_SHEET_PERMISSION_USER_PART, component, { framework }));
        }
        this.disposeWithMe(iconManager.register(sheetsUIIcons));
    }
}
