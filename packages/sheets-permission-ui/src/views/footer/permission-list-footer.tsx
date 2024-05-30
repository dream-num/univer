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

import { Button } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React from 'react';
import { ISidebarService, useObservable } from '@univerjs/ui';
import type { Workbook } from '@univerjs/core';
import { IPermissionService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { WorkbookEditablePermission, WorkbookManageCollaboratorPermission, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { UNIVER_SHEET_PERMISSION_PANEL, UNIVER_SHEET_PERMISSION_PANEL_FOOTER } from '../../const';
import { SheetPermissionPanelModel } from '../../service/sheet-permission-panel.model';
import styles from './index.module.less';

export const SheetPermissionPanelAddFooter = () => {
    const sidebarService = useDependency(ISidebarService);
    const localeService = useDependency(LocaleService);

    const univerInstanceService = useDependency(IUniverInstanceService);
    const permissionService = useDependency(IPermissionService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const unitId = workbook.getUnitId();
    const activeSheet$ = useObservable(workbook.activeSheet$);

    const workbookEditPermission = permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id)?.value ?? false;
    const workbookManagePermission = permissionService.getPermissionPoint(new WorkbookManageCollaboratorPermission(unitId).id)?.value ?? false;

    const hasSetProtectPermission = workbookEditPermission && workbookManagePermission;
    const sheetPermissionPanelModel = useDependency(SheetPermissionPanelModel);
    const worksheetProtectionRuleModel = useDependency(WorksheetProtectionRuleModel);

    const subUnitId = activeSheet$?.getSheetId();
    if (!subUnitId) {
        return null;
    }

    const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);

    if (!hasSetProtectPermission || worksheetRule) {
        return null;
    }
    return (
        <div>
            <Button
                className={styles.sheetPermissionPanelAddButton}
                type="primary"
                onClick={() => {
                    sheetPermissionPanelModel.resetRule();
                    const sidebarProps = {
                        header: { title: '保护行列' },
                        children: {
                            label: UNIVER_SHEET_PERMISSION_PANEL,
                            showDetail: true,
                        },
                        width: 320,
                        footer: {
                            label: UNIVER_SHEET_PERMISSION_PANEL_FOOTER,
                            showDetail: true,
                        },
                    };
                    sidebarService.open(sidebarProps);
                }}
            >
                <div>+ </div>
                {localeService.t('permission.button.addNewPermission')}
            </Button>
        </div>
    );
};
