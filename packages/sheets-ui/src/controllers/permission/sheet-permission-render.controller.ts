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

import { Disposable, IPermissionService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IMenuItemFactory, MenuConfig } from '@univerjs/ui';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { CheckMarkSingle, DeleteSingle, LockSingle, ProtectSingle, WriteSingle } from '@univerjs/icons';
import { RangeProtectionRuleModel } from '@univerjs/sheets';
import type { IRenderContext, Spreadsheet } from '@univerjs/engine-render';
import { merge, throttleTime } from 'rxjs';
import { sheetPermissionAddProtectContextMenuFactory, sheetPermissionChangeSheetPermissionSheetBarMenuFactory, sheetPermissionContextMenuFactory, sheetPermissionEditProtectContextMenuFactory, sheetPermissionProtectSheetInSheetBarMenuFactory, sheetPermissionRemoveProtectContextMenuFactory, sheetPermissionRemoveProtectionSheetBarMenuFactory, sheetPermissionToolbarMenuFactory, sheetPermissionViewAllProtectRuleContextMenuFactory, sheetPermissionViewAllProtectRuleSheetBarMenuFactory } from '../menu/permission.menu';
import { permissionCheckIconKey, permissionDeleteIconKey, permissionEditIconKey, permissionLockIconKey, permissionMenuIconKey, UNIVER_SHEET_PERMISSION_DIALOG, UNIVER_SHEET_PERMISSION_PANEL, UNIVER_SHEET_PERMISSION_PANEL_FOOTER, UNIVER_SHEET_PERMISSION_USER_DIALOG } from '../../basics/const/permission';
import { SheetPermissionDialog, SheetPermissionPanel, SheetPermissionPanelFooter, SheetPermissionUserDialog } from '../../views/permission';
import { UNIVER_SHEET_PERMISSION_ALERT_DIALOG } from '../../views/permission/error-msg-dialog/interface';
import { AlertDialog } from '../../views/permission/error-msg-dialog';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY, RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY, RangeProtectionCanNotViewRenderExtension, RangeProtectionCanViewRenderExtension } from '../../views/permission/extensions/range-protection.render';

export interface IUniverSheetsPermissionMenuConfig {
    menu: MenuConfig;
}

export const DefaultSheetPermissionMenuConfig = {};

@OnLifecycle(LifecycleStages.Rendered, SheetPermissionRenderManagerController)
export class SheetPermissionRenderManagerController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverSheetsPermissionMenuConfig>,
        @IMenuService private _menuService: IMenuService,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
        this._init();
    }

    private _init() {
        this._initToolbarMenu();
        this._initContextMenu();
        this._initComponents();
    }

    private _initToolbarMenu() {
        const { menu = {} } = this._config;
        ([
            sheetPermissionToolbarMenuFactory,
        ]).forEach((menuFactory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(menuFactory), menu));
        });
    }

    private _initContextMenu() {
        const { menu = {} } = this._config;
        ([
            sheetPermissionContextMenuFactory,
            sheetPermissionAddProtectContextMenuFactory,
            sheetPermissionEditProtectContextMenuFactory,
            sheetPermissionRemoveProtectContextMenuFactory,
            sheetPermissionViewAllProtectRuleContextMenuFactory,
            sheetPermissionProtectSheetInSheetBarMenuFactory,
            sheetPermissionRemoveProtectionSheetBarMenuFactory,
            sheetPermissionChangeSheetPermissionSheetBarMenuFactory,
            sheetPermissionViewAllProtectRuleSheetBarMenuFactory,
        ] as IMenuItemFactory[]).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), menu));
        });
    }

    private _initComponents() {
        ([
            [permissionMenuIconKey, ProtectSingle],
            [permissionDeleteIconKey, DeleteSingle],
            [permissionEditIconKey, WriteSingle],
            [permissionCheckIconKey, CheckMarkSingle],
            [permissionLockIconKey, LockSingle],
            [UNIVER_SHEET_PERMISSION_PANEL, SheetPermissionPanel],
            [UNIVER_SHEET_PERMISSION_PANEL_FOOTER, SheetPermissionPanelFooter],
            [UNIVER_SHEET_PERMISSION_USER_DIALOG, SheetPermissionUserDialog],
            [UNIVER_SHEET_PERMISSION_DIALOG, SheetPermissionDialog],
            [UNIVER_SHEET_PERMISSION_ALERT_DIALOG, AlertDialog],
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(this._componentManager.register(
                key,
                component
            ));
        });
    }
}

export class SheetPermissionRenderController extends Disposable {
    private _rangeProtectionCanViewRenderExtension = new RangeProtectionCanViewRenderExtension();
    private _rangeProtectionCanNotViewRenderExtension = new RangeProtectionCanNotViewRenderExtension();

    constructor(
        private readonly _context: IRenderContext,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IPermissionService private _permissionService: IPermissionService
    ) {
        super();

        this._initRender();
        this._initSkeleton();

        this._rangeProtectionRuleModel.ruleChange$.subscribe((info) => {
            if ((info.oldRule?.id && this._rangeProtectionCanViewRenderExtension.renderCache.has(info.oldRule.id)) || this._rangeProtectionCanViewRenderExtension.renderCache.has(info.rule.id)) {
                this._rangeProtectionCanViewRenderExtension.clearCache();
            }
            if ((info.oldRule?.id && this._rangeProtectionCanNotViewRenderExtension.renderCache.has(info.oldRule.id)) || this._rangeProtectionCanNotViewRenderExtension.renderCache.has(info.rule.id)) {
                this._rangeProtectionCanNotViewRenderExtension.clearCache();
            }
        });
    }

    private _initRender() {
        const spreadsheetRender = this._context.mainComponent as Spreadsheet;
        if (spreadsheetRender) {
            if (!spreadsheetRender.getExtensionByKey(RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY)) {
                spreadsheetRender.register(this._rangeProtectionCanViewRenderExtension);
            }
            if (!spreadsheetRender.getExtensionByKey(RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY)) {
                spreadsheetRender.register(this._rangeProtectionCanNotViewRenderExtension);
            }
        }
    }

    private _initSkeleton() {
        const markDirtySkeleton = () => {
            this._sheetSkeletonManagerService.reCalculate();
            this._context.mainComponent?.makeDirty();
        };

        this.disposeWithMe(merge(
            this._permissionService.permissionPointUpdate$.pipe(throttleTime(300, undefined, { trailing: true })),
            this._rangeProtectionRuleModel.ruleChange$
        ).pipe().subscribe(markDirtySkeleton));
    }
}
