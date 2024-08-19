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

import React from 'react';
import { IUniverInstanceService, useDependency } from '@univerjs/core';
import { getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { serializeRangeWithSheet } from '@univerjs/engine-formula';
import { SheetPermissionPanelList } from '../panel-list';
import { SheetPermissionPanelDetail } from '../panel-detail';
import { SheetPermissionPanelModel } from '../../../services/permission/sheet-permission-panel.model';

interface ISheetPermissionPanelProps { showDetail: boolean; fromSheetBar: boolean };

export const SheetPermissionPanel = ({ showDetail, fromSheetBar }: ISheetPermissionPanelProps) => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const sheetsSelectionsService = useDependency(SheetsSelectionsService);
    const sheetPermissionPanelModel = useDependency(SheetPermissionPanelModel);

    if (!sheetPermissionPanelModel.getVisible()) return null;

    const target = getSheetCommandTarget(univerInstanceService);
    if (!target) return null;
    const { worksheet } = target;

    const selectionRanges = sheetsSelectionsService.getCurrentSelections()?.map((selection) => selection.range);
    const key = selectionRanges.reduce((acc, range) => acc + serializeRangeWithSheet(worksheet.getName(), range), '');

    return (
        showDetail ? <SheetPermissionPanelDetail fromSheetBar={fromSheetBar} key={key} /> : <SheetPermissionPanelList key={key} />
    );
};
