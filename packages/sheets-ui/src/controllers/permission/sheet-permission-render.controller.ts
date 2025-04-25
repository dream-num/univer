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

import type { IRenderContext, IRenderModule, Spreadsheet } from '@univerjs/engine-render';
import type { MenuConfig } from '@univerjs/ui';
import type { IUniverSheetsUIConfig } from '../config.schema';
import { Disposable, IConfigService, Inject, Injector, IPermissionService, IUniverInstanceService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CheckMarkSingle, DeleteSingle, LockSingle, ProtectSingle, WriteSingle } from '@univerjs/icons';
import { RangeProtectionRuleModel, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { ComponentManager, connectInjector, IUIPartsService } from '@univerjs/ui';
import { merge, throttleTime } from 'rxjs';
import { permissionCheckIconKey, permissionDeleteIconKey, permissionEditIconKey, permissionLockIconKey, permissionMenuIconKey, UNIVER_SHEET_PERMISSION_BACKGROUND, UNIVER_SHEET_PERMISSION_DIALOG, UNIVER_SHEET_PERMISSION_PANEL, UNIVER_SHEET_PERMISSION_USER_DIALOG, UNIVER_SHEET_PERMISSION_USER_PART } from '../../consts/permission';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { SheetPermissionDialog, SheetPermissionPanel, SheetPermissionUserDialog } from '../../views/permission';
import { AlertDialog } from '../../views/permission/error-msg-dialog';
import { UNIVER_SHEET_PERMISSION_ALERT_DIALOG } from '../../views/permission/error-msg-dialog/interface';
import { RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY, RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY, RangeProtectionCanNotViewRenderExtension, RangeProtectionCanViewRenderExtension } from '../../views/permission/extensions/range-protection.render';
import { worksheetProtectionKey, WorksheetProtectionRenderExtension } from '../../views/permission/extensions/worksheet-permission.render';
import { PermissionDetailUserPart } from '../../views/permission/panel-detail/PermissionDetailUserPart';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../config.schema';

export interface IUniverSheetsPermissionMenuConfig {
    menu: MenuConfig;
}

export class SheetPermissionRenderManagerController extends Disposable {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(IUIPartsService) private _uiPartsService: IUIPartsService
    ) {
        super();
        this._init();
    }

    private _init(): void {
        this._initComponents();
        this._initUiPartComponents();
    }

    private _initComponents(): void {
        ([
            [permissionMenuIconKey, ProtectSingle],
            [permissionDeleteIconKey, DeleteSingle],
            [permissionEditIconKey, WriteSingle],
            [permissionCheckIconKey, CheckMarkSingle],
            [permissionLockIconKey, LockSingle],
            [UNIVER_SHEET_PERMISSION_PANEL, SheetPermissionPanel],
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

    private _initUiPartComponents(): void {
        const configService = this._injector.get(IConfigService);
        const config = configService.getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
        if (!config?.customComponents?.has(UNIVER_SHEET_PERMISSION_USER_PART)) {
            this.disposeWithMe(this._uiPartsService.registerComponent(UNIVER_SHEET_PERMISSION_USER_PART, () => connectInjector(PermissionDetailUserPart, this._injector)));
        }
    }
}

export class SheetPermissionRenderController extends Disposable implements IRenderModule {
    private _rangeProtectionCanViewRenderExtension = new RangeProtectionCanViewRenderExtension();
    private _rangeProtectionCanNotViewRenderExtension = new RangeProtectionCanNotViewRenderExtension();

    constructor(
        private readonly _context: IRenderContext,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IPermissionService private _permissionService: IPermissionService,
        @IConfigService private _configService: IConfigService
    ) {
        super();

        const config = this._configService.getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
        this._initSkeleton();
        if (config?.customComponents?.has(UNIVER_SHEET_PERMISSION_BACKGROUND)) {
            return;
        }
        this._initRender();

        this.disposeWithMe(this._rangeProtectionRuleModel.ruleChange$.subscribe((info) => {
            if ((info.oldRule?.id && this._rangeProtectionCanViewRenderExtension.renderCache.has(info.oldRule.id)) || this._rangeProtectionCanViewRenderExtension.renderCache.has(info.rule.id)) {
                this._rangeProtectionCanViewRenderExtension.clearCache();
            }
            if ((info.oldRule?.id && this._rangeProtectionCanNotViewRenderExtension.renderCache.has(info.oldRule.id)) || this._rangeProtectionCanNotViewRenderExtension.renderCache.has(info.rule.id)) {
                this._rangeProtectionCanNotViewRenderExtension.clearCache();
            }
        }));
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
            this._rangeProtectionRuleModel.rangeRuleInitStateChange$,
            this._rangeProtectionRuleModel.ruleChange$
        ).pipe().subscribe(markDirtySkeleton));
    }
}

export class WorksheetProtectionRenderController extends Disposable implements IRenderModule {
    private _worksheetProtectionRenderExtension = new WorksheetProtectionRenderExtension();
    constructor(
        private readonly _context: IRenderContext,
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(WorksheetProtectionRuleModel) private _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @Inject(IConfigService) private _configService: IConfigService
    ) {
        super();

        const config = this._configService.getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
        this._initSkeleton();
        if (config?.customComponents?.has(UNIVER_SHEET_PERMISSION_BACKGROUND)) {
            return;
        }

        this._initRender();
    }

    private _initRender() {
        const renderId = this._context.unitId;
        const render = renderId && this._renderManagerService.getRenderById(renderId);
        const spreadsheetRender = render && render.mainComponent as Spreadsheet;
        if (spreadsheetRender) {
            if (!spreadsheetRender.getExtensionByKey(worksheetProtectionKey)) {
                spreadsheetRender.register(this._worksheetProtectionRenderExtension);
            }
        }
    }

    private _initSkeleton(): void {
        const markDirtySkeleton = () => {
            this._sheetSkeletonManagerService.reCalculate();
            this._context.mainComponent?.makeDirty();
        };

        this.disposeWithMe(merge(
            this._worksheetProtectionRuleModel.worksheetRuleInitStateChange$
        ).pipe().subscribe(markDirtySkeleton));
    }
}
