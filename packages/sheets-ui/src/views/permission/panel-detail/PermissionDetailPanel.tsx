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

import type { IRange, Workbook } from '@univerjs/core';
import type { IPermissionPanelRule } from '../../../services/permission/sheet-permission-panel.model';
import { Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { EditStateEnum, ViewStateEnum } from '@univerjs/sheets';
import { ComponentContainer, ISidebarService, useComponentsOfPart, useDependency } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import { UNIVER_SHEET_PERMISSION_USER_PART } from '../../../consts/permission';
import { checkRangeValid, generateDefaultRule, generateRuleByUnitType } from '../util';
import { PermissionDetailFooterPart } from './PermissionDetailFooterPart';
import { PermissionDetailMainPart } from './PermissionDetailMainPart';

interface ISheetPermissionPanelDetailProps {
    fromSheetBar: boolean;
    rule?: IPermissionPanelRule;
    oldRule?: IPermissionPanelRule;
}

export const SheetPermissionPanelDetail = (props: ISheetPermissionPanelDetailProps) => {
    const { fromSheetBar, rule, oldRule } = props;
    const injector = useDependency(Injector);
    const activeRule: IPermissionPanelRule = rule ? generateRuleByUnitType(injector, rule) : generateDefaultRule(injector, fromSheetBar);

    const [ranges, setRanges] = useState<IRange[]>(activeRule.ranges);
    const [rangesErrMsg, setRangesErrMsg] = useState<string | undefined>(() => {
        return checkRangeValid(injector, activeRule.ranges, activeRule.permissionId, activeRule.unitId, activeRule.subUnitId);
    });
    const [desc, setDesc] = useState<string | undefined>(activeRule.description);
    const [editState, setEditState] = useState<EditStateEnum>(activeRule.editState ?? EditStateEnum.OnlyMe);
    const [viewState, setViewState] = useState<ViewStateEnum>(activeRule.viewState ?? ViewStateEnum.OthersCanView);
    const PermissionDetailUserPart = useComponentsOfPart(UNIVER_SHEET_PERMISSION_USER_PART);

    useEffect(() => {
        const univerInstanceService = injector.get(IUniverInstanceService);
        const sidebarService = injector.get(ISidebarService);
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return;
        const subUnitId = workbook.getActiveSheet().getSheetId();
        const activeSheetSubscribe = workbook.activeSheet$.subscribe((sheet) => {
            if (sheet?.getSheetId() !== subUnitId) {
                sidebarService.close();
            }
        });
        return () => {
            activeSheetSubscribe.unsubscribe();
        };
    }, []);

    return (
        <div
            className="univer-mt-4 univer-flex univer-h-[calc(100%-16px)] univer-flex-col"
        >
            <PermissionDetailMainPart
                permissionId={activeRule.permissionId}
                ranges={ranges}
                onRangesChange={(v: IRange[], err?: string) => {
                    setRanges(v);
                    setRangesErrMsg(err);
                }}
                rangesErrMsg={rangesErrMsg}
                desc={desc}
                onDescChange={(v) => setDesc(v)}
            />
            <ComponentContainer
                key="user-part"
                components={PermissionDetailUserPart}
                sharedProps={{
                    editState,
                    onEditStateChange: (v: EditStateEnum) => setEditState(v),
                    viewState,
                    onViewStateChange: (v: ViewStateEnum) => setViewState(v),
                    permissionId: activeRule.permissionId,
                }}
            />
            <PermissionDetailFooterPart
                permissionId={activeRule.permissionId}
                id={activeRule.id}
                ranges={ranges}
                rangesErrMsg={rangesErrMsg}
                desc={desc}
                viewState={viewState}
                editState={editState}
                oldRule={oldRule}
            />
        </div>
    );
};
