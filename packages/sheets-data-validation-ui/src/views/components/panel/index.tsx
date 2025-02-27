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

import type { Workbook } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { useDependency, useObservable } from '@univerjs/ui';
import { of } from 'rxjs';
import { DataValidationPanelService } from '../../../services/data-validation-panel.service';
import { DataValidationDetail } from '../detail';
import { DataValidationList } from '../list';

export const DataValidationPanel = () => {
    const dataValidationPanelService = useDependency(DataValidationPanelService);
    const activeRule = useObservable(dataValidationPanelService.activeRule$, dataValidationPanelService.activeRule);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = useObservable(
        () => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET),
        undefined,
        undefined,
        []
    );
    const worksheet = useObservable(() => workbook?.activeSheet$ ?? of(null), undefined, undefined, []);
    if (!workbook || !worksheet) return null;

    return (
        activeRule && activeRule.subUnitId === worksheet.getSheetId()
            ? <DataValidationDetail key={activeRule.rule.uid} />
            : <DataValidationList workbook={workbook} />
    );
};
