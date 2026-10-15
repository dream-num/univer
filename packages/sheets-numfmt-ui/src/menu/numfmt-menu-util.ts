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

import type { IAccessor } from '@univerjs/core';
import type { FormatType } from '@univerjs/sheets';
import type { Observable } from 'rxjs';
import type { LocaleKey } from '../locale/types';
import {
    fromCallback,
    ICommandService,
    isDefaultFormat,
    isPatternEqualWithoutDecimal,
    isTextFormat,
    IUniverInstanceService,
} from '@univerjs/core';
import { RemoveNumfmtMutation, SetNumfmtMutation, SetRangeValuesMutation, SheetsSelectionsService } from '@univerjs/sheets';
import { getPatternType } from '@univerjs/sheets-numfmt';
import { deriveStateFromActiveSheet$ } from '@univerjs/sheets-ui';
import { distinctUntilChanged, filter, map, merge, startWith } from 'rxjs';
import { MENU_OPTIONS } from './number-format-options';

const FORMAT_TYPE_LABELS: Partial<Record<FormatType, LocaleKey>> = {
    currency: 'sheets-numfmt-ui.currency',
    date: 'sheets-numfmt-ui.date',
    datetime: 'sheets-numfmt-ui.dateTime',
    general: 'sheets-numfmt-ui.general',
    grouped: 'sheets-numfmt-ui.number',
    number: 'sheets-numfmt-ui.number',
    percent: 'sheets-numfmt-ui.percent',
    scientific: 'sheets-numfmt-ui.scientific',
    text: 'sheets-numfmt-ui.text',
    time: 'sheets-numfmt-ui.time',
};

export function getNumberFormatLabelKey(pattern: string | undefined, currencySymbol: string): LocaleKey {
    if (!pattern || isDefaultFormat(pattern)) {
        return 'sheets-numfmt-ui.general';
    }
    if (isTextFormat(pattern)) {
        return 'sheets-numfmt-ui.text';
    }

    const preset = MENU_OPTIONS(currencySymbol).find((option) =>
        typeof option === 'object' && option.pattern && isPatternEqualWithoutDecimal(pattern, option.pattern));
    if (preset && typeof preset === 'object') {
        return preset.label;
    }

    return FORMAT_TYPE_LABELS[getPatternType(pattern)] ?? 'sheets-numfmt-ui.moreFmt';
}

export function getCurrentNumfmtPattern$(accessor: IAccessor): Observable<string | undefined> {
    const commandService = accessor.get(ICommandService);
    const instanceService = accessor.get(IUniverInstanceService);
    const selectionService = accessor.get(SheetsSelectionsService);
    const commandIds = [RemoveNumfmtMutation.id, SetNumfmtMutation.id, SetRangeValuesMutation.id];

    return deriveStateFromActiveSheet$<string | undefined>(instanceService, undefined, ({ worksheet }) => merge(
        selectionService.selectionChanged$,
        fromCallback(commandService.onCommandExecuted.bind(commandService)).pipe(
            filter(([command]) => commandIds.includes(command.id))
        )
    ).pipe(
        startWith(null),
        map(() => {
            const selection = selectionService.getCurrentLastSelection();
            if (!selection) {
                return undefined;
            }
            const cell = selection.primary ?? selection.range;
            return worksheet.getCellStyle(cell.startRow, cell.startColumn)?.n?.pattern;
        })
    )).pipe(distinctUntilChanged());
}
