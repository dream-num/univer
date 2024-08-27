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

import { Disposable, Inject, IPermissionService } from '@univerjs/core';
import type { MenuConfig } from '@univerjs/ui';
import { ComponentManager } from '@univerjs/ui';
import { CheckMarkSingle, DeleteSingle, LockSingle, ProtectSingle, WriteSingle } from '@univerjs/icons';
import { RangeProtectionRuleModel } from '@univerjs/sheets';
import type { IRenderContext, IRenderModule, Spreadsheet } from '@univerjs/engine-render';
import { merge, throttleTime } from 'rxjs';
import { permissionCheckIconKey, permissionDeleteIconKey, permissionEditIconKey, permissionLockIconKey, permissionMenuIconKey, UNIVER_SHEET_PERMISSION_DIALOG, UNIVER_SHEET_PERMISSION_PANEL, UNIVER_SHEET_PERMISSION_PANEL_FOOTER, UNIVER_SHEET_PERMISSION_USER_DIALOG } from '../../consts/permission';
import { SheetPermissionDialog, SheetPermissionPanel, SheetPermissionPanelFooter, SheetPermissionUserDialog } from '../../views/permission';
import { UNIVER_SHEET_PERMISSION_ALERT_DIALOG } from '../../views/permission/error-msg-dialog/interface';
import { AlertDialog } from '../../views/permission/error-msg-dialog';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY, RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY, RangeProtectionCanNotViewRenderExtension, RangeProtectionCanViewRenderExtension } from '../../views/permission/extensions/range-protection.render';

export interface IUniverSheetsPermissionMenuConfig {
    menu: MenuConfig;
}

export class SheetPermissionRenderManagerController extends Disposable {
    constructor(@Inject(ComponentManager) private _componentManager: ComponentManager) {
        super();
        this._init();
    }

    private _init(): void {
        this._initComponents();
    }

    private _initComponents(): void {
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

export class SheetPermissionRenderController extends Disposable implements IRenderModule {
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

    private _initRender(): void {
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

    private _initSkeleton(): void {
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
