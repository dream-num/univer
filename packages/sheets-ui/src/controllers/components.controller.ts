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

import type { IUniverSheetsUIConfig } from '../config/config';
import { Disposable, IConfigService, Inject, Injector } from '@univerjs/core';
import {
    AddImageIcon,
    AdjustHeightDoubleIcon,
    AdjustWidthDoubleIcon,
    AlignBottomIcon,
    AlignTopIcon,
    AllBorderIcon,
    AutoHeightDoubleIcon,
    AutoWidthDoubleIcon,
    AutowrapIcon,
    BackSlashDoubleIcon,
    BoldIcon,
    BrushIcon,
    CancelFreezeIcon,
    CancelMergeIcon,
    CheckMarkIcon,
    ClearFormatDoubleIcon,
    CodeIcon,
    ConvertToNumberIcon,
    CopyDoubleIcon,
    CutIcon,
    DeleteCellShiftLeftDoubleIcon,
    DeleteCellShiftUpDoubleIcon,
    DeleteColumnDoubleIcon,
    DeleteIcon,
    DeleteRowDoubleIcon,
    DownBorderDoubleIcon,
    DownloadImageIcon,
    EyeIcon,
    FontColorDoubleIcon,
    FontSizeIncreaseIcon,
    FontSizeReduceIcon,
    FreezeColumnIcon,
    FreezeRowIcon,
    FreezeToSelectedIcon,
    HideDoubleIcon,
    HideGridlinesIcon,
    HorizontalBorderDoubleIcon,
    HorizontallyIcon,
    HorizontalMergeIcon,
    InnerBorderDoubleIcon,
    InsertCellDownDoubleIcon,
    InsertCellShiftRightDoubleIcon,
    InsertDoubleIcon,
    InsertRowAboveDoubleIcon,
    InsertRowBelowDoubleIcon,
    ItalicIcon,
    LeftBorderDoubleIcon,
    LeftDoubleDiagonalDoubleIcon,
    LeftInsertColumnDoubleIcon,
    LeftJustifyingIcon,
    LeftRotationFortyFiveDegreesIcon,
    LeftRotationNinetyDegreesIcon,
    LeftTridiagonalDoubleIcon,
    LockIcon,
    MergeAllIcon,
    NoBorderIcon,
    NoColorDoubleIcon,
    NoRotationIcon,
    OuterBorderDoubleIcon,
    OverflowIcon,
    PaintBucketDoubleIcon,
    PasteSpecialDoubleIcon,
    ProtectIcon,
    ReduceDoubleIcon,
    RightBorderDoubleIcon,
    RightDoubleDiagonalDoubleIcon,
    RightInsertColumnDoubleIcon,
    RightJustifyingIcon,
    RightRotationFortyFiveDegreesIcon,
    RightRotationNinetyDegreesIcon,
    ShrinkToFitIcon,
    SlashDoubleIcon,
    StrikethroughIcon,
    SubscriptIcon,
    SuperscriptIcon,
    TruncationIcon,
    UnderlineIcon,
    UpBorderDoubleIcon,
    VerticalBorderDoubleIcon,
    VerticalCenterIcon,
    VerticalIntegrationIcon,
    VerticalTextIcon,
    WriteIcon,
} from '@univerjs/icons';
import { ComponentManager, IconManager } from '@univerjs/ui';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../config/config';
import {
    UNIVER_SHEET_PERMISSION_DIALOG,
    UNIVER_SHEET_PERMISSION_PANEL,
    UNIVER_SHEET_PERMISSION_USER_DIALOG,
    UNIVER_SHEET_PERMISSION_USER_PART,
} from '../consts/permission';
import { BorderPanel } from '../views/border-panel/BorderPanel';
import { BORDER_PANEL_COMPONENT } from '../views/border-panel/interface';
import { CELL_ALERT_KEY } from '../views/cell-alert';
import { CellAlert } from '../views/cell-alert/CellAlertPopup';
import { CELL_POPUP_COMPONENT_KEY } from '../views/cell-popup/config';
import { CellPopup } from '../views/CellPopup';
import { DEFINED_NAME_CONTAINER } from '../views/defined-name/component-name';
import { DefinedNameContainer } from '../views/defined-name/DefinedNameContainer';
import { dropdownMap } from '../views/dropdown';
import { MENU_ITEM_FROZEN_COMPONENT } from '../views/menu-item-frozen/interface';
import { MenuItemFrozen } from '../views/menu-item-frozen/MenuItemFrozen';
import { MENU_ITEM_INPUT_COMPONENT } from '../views/menu-item-input/interface';
import { MenuItemInput } from '../views/menu-item-input/MenuItemInput';
import { AlertDialog } from '../views/permission/AlertDialog';
import { UNIVER_SHEET_PERMISSION_ALERT_DIALOG } from '../views/permission/error-msg-dialog/interface';
import { SheetPermissionDialog } from '../views/permission/SheetPermissionDialog';
import { SheetPermissionPanel } from '../views/permission/SheetPermissionPanel';
import { SheetPermissionUserDialog } from '../views/permission/SheetPermissionUserDialog';
import { SHEET_ZOOM_INPUT_COMPONENT, SheetZoomInput } from '../views/sheet-slider/SheetZoomInput';

const sheetUiIcons = {
    AdjustHeightDoubleIcon,
    AdjustWidthDoubleIcon,
    AddImageIcon,
    AlignBottomIcon,
    AlignTopIcon,
    AllBorderIcon,
    AutoHeightDoubleIcon,
    AutoWidthDoubleIcon,
    AutowrapIcon,
    BackSlashDoubleIcon,
    BoldIcon,
    BrushIcon,
    CancelFreezeIcon,
    CancelMergeIcon,
    CheckMarkIcon,
    ClearFormatDoubleIcon,
    CodeIcon,
    ConvertToNumberIcon,
    CopyDoubleIcon,
    CutIcon,
    DeleteCellShiftLeftDoubleIcon,
    DeleteCellShiftUpDoubleIcon,
    DeleteColumnDoubleIcon,
    DeleteIcon,
    DeleteRowDoubleIcon,
    DownBorderDoubleIcon,
    DownloadImageIcon,
    EyeIcon,
    FontColorDoubleIcon,
    FontSizeIncreaseIcon,
    FontSizeReduceIcon,
    FreezeColumnIcon,
    FreezeRowIcon,
    FreezeToSelectedIcon,
    HideDoubleIcon,
    HideGridlinesIcon,
    HorizontalBorderDoubleIcon,
    HorizontalMergeIcon,
    HorizontallyIcon,
    InnerBorderDoubleIcon,
    InsertCellDownDoubleIcon,
    InsertCellShiftRightDoubleIcon,
    InsertDoubleIcon,
    InsertRowAboveDoubleIcon,
    InsertRowBelowDoubleIcon,
    ItalicIcon,
    LeftBorderDoubleIcon,
    LeftDoubleDiagonalDoubleIcon,
    LeftInsertColumnDoubleIcon,
    LeftJustifyingIcon,
    LeftRotationFortyFiveDegreesIcon,
    LeftRotationNinetyDegreesIcon,
    LeftTridiagonalDoubleIcon,
    LockIcon,
    MergeAllIcon,
    NoBorderIcon,
    NoColorDoubleIcon,
    NoRotationIcon,
    OuterBorderDoubleIcon,
    OverflowIcon,
    PaintBucketDoubleIcon,
    PasteSpecialDoubleIcon,
    ProtectIcon,
    ReduceDoubleIcon,
    RightBorderDoubleIcon,
    RightDoubleDiagonalDoubleIcon,
    RightInsertColumnDoubleIcon,
    RightJustifyingIcon,
    RightRotationFortyFiveDegreesIcon,
    RightRotationNinetyDegreesIcon,
    ShrinkToFitIcon,
    SlashDoubleIcon,
    StrikethroughIcon,
    SubscriptIcon,
    SuperscriptIcon,
    TruncationIcon,
    UnderlineIcon,
    UpBorderDoubleIcon,
    VerticalBorderDoubleIcon,
    VerticalCenterIcon,
    VerticalIntegrationIcon,
    VerticalTextIcon,
    WriteIcon,
};

export class ComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(IconManager) private readonly _iconManager: IconManager,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._registerComponents();
        this._registerIcons();
    }

    private _registerComponents(): void {
        this.disposeWithMe(
            this._componentManager.register(CELL_ALERT_KEY, CellAlert)
        );

        ([
            [UNIVER_SHEET_PERMISSION_PANEL, SheetPermissionPanel],
            [UNIVER_SHEET_PERMISSION_USER_DIALOG, SheetPermissionUserDialog],
            [UNIVER_SHEET_PERMISSION_DIALOG, SheetPermissionDialog],
            [UNIVER_SHEET_PERMISSION_ALERT_DIALOG, AlertDialog],
        ] as const).forEach(([key, comp]) => {
            this.disposeWithMe(this._componentManager.register(
                key,
                comp
            ));
        });

        const configService = this._injector.get(IConfigService);
        const config = configService.getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);

        if (config?.protectedRangeUserSelector) {
            const { component, framework } = config.protectedRangeUserSelector;
            this.disposeWithMe(
                this._componentManager.register(UNIVER_SHEET_PERMISSION_USER_PART, component, {
                    framework,
                })
            );
        }

        // init custom components
        this.disposeWithMe(this._componentManager.register(MENU_ITEM_INPUT_COMPONENT, MenuItemInput));
        this.disposeWithMe(this._componentManager.register(MENU_ITEM_FROZEN_COMPONENT, MenuItemFrozen));
        this.disposeWithMe(this._componentManager.register(SHEET_ZOOM_INPUT_COMPONENT, SheetZoomInput));
        this.disposeWithMe(this._componentManager.register(BORDER_PANEL_COMPONENT, BorderPanel));
        this.disposeWithMe(this._componentManager.register(DEFINED_NAME_CONTAINER, DefinedNameContainer));
        this.disposeWithMe(this._componentManager.register(CELL_POPUP_COMPONENT_KEY, CellPopup));
        Object.values(dropdownMap).forEach((component) => {
            this.disposeWithMe(this._componentManager.register(component.componentKey, component));
        });
    }

    private _registerIcons(): void {
        this.disposeWithMe(this._iconManager.register(sheetUiIcons));
    }
}
