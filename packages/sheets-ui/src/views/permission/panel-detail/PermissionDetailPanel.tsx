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

import type { IRange } from '@univerjs/core';
import type { IPermissionPanelRule } from '../../../services/permission/sheet-permission-panel.model';
import { Injector, Tools, useDependency } from '@univerjs/core';
import { EditStateEnum, ViewStateEnum } from '@univerjs/sheets';
import React, { useRef, useState } from 'react';
import { checkRangeValid, generateDefaultRule } from '../util';
import styles from './index.module.less';
import { PermissionDetailFooterPart } from './PermissionDetailFooterPart';
import { PermissionDetailMainPart } from './PermissionDetailMainPart';
import { PermissionDetailUserPart } from './PermissionDetailUserPart';

interface ISheetPermissionPanelDetailProps {
    fromSheetBar: boolean;
    rule?: IPermissionPanelRule;
    oldRule?: IPermissionPanelRule;
}

export const SheetPermissionPanelDetail = (props: ISheetPermissionPanelDetailProps) => {
    const { fromSheetBar, rule, oldRule } = props;
    const injector = useDependency(Injector);

    const activeRule = rule ? Tools.deepClone(rule) : generateDefaultRule(injector, fromSheetBar);

    const [ranges, setRanges] = useState<IRange[]>(activeRule.ranges);
    const [rangesErrMsg, setRangesErrMsg] = useState<string | undefined>(() => {
        return checkRangeValid(injector, activeRule.ranges, activeRule.permissionId, activeRule.unitId, activeRule.subUnitId);
    });
    const [desc, setDesc] = useState<string | undefined>(activeRule.description);
    const [editState, setEditState] = useState<EditStateEnum>(activeRule.editState ?? EditStateEnum.OnlyMe);
    const [viewState, setViewState] = useState<ViewStateEnum>(activeRule.viewState ?? ViewStateEnum.OthersCanView);
    const rangeSelectorActionsRef = useRef<any>({});
    const [isFocusRangeSelector, isFocusRangeSelectorSet] = useState(false);

    const handlePanelClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const handleOutClick = rangeSelectorActionsRef.current?.handleOutClick;
        handleOutClick && handleOutClick(e, isFocusRangeSelectorSet);
    };

    return (
        <div className={styles.permissionPanelDetailWrapper} onClick={handlePanelClick}>
            <PermissionDetailMainPart
                permissionId={activeRule.permissionId}
                ranges={ranges}
                onRangesChange={(v: IRange[], err?: string) => {
                    setRanges(v);
                    setRangesErrMsg(err);
                }}
                isFocusRangeSelector={isFocusRangeSelector}
                rangesErrMsg={rangesErrMsg}
                desc={desc}
                onDescChange={(v) => setDesc(v)}
                rangeSelectorRef={rangeSelectorActionsRef}
            />
            <PermissionDetailUserPart
                editState={editState}
                onEditStateChange={(v) => setEditState(v as EditStateEnum)}
                viewState={viewState}
                onViewStateChange={(v) => setViewState(v as ViewStateEnum)}
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
