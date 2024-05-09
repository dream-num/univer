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

import type { Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { ThreadCommentPanel } from '@univerjs/thread-comment-ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useMemo } from 'react';
import { map } from 'rxjs';
import { ShowAddSheetCommentModalOperation } from '../../commands/operations/comment.operation';

export const SheetsThreadCommentPanel = () => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    if (!workbook) {
        return null;
    }
    const unitId = workbook.getUnitId();
    const commandService = useDependency(ICommandService);
    const subUnitId$ = useMemo(() => workbook.activeSheet$.pipe(map((i) => i?.getSheetId())), [workbook.activeSheet$]);

    const handleAdd = () => {
        commandService.executeCommand(ShowAddSheetCommentModalOperation.id);
    };

    return (
        <ThreadCommentPanel
            unitId={unitId}
            subUnitId$={subUnitId$}
            type={UniverInstanceType.UNIVER_SHEET}
            onAdd={handleAdd}
        />
    );
};
