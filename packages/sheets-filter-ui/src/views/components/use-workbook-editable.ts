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
import { IPermissionService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { WorkbookEditablePermission } from '@univerjs/sheets';
import { useDependency, useObservable } from '@univerjs/ui';
import { of } from 'rxjs';

/** Whether the active workbook may edit, used to hide editor-only filter controls. */
export function useWorkbookEditable(): boolean {
    const instanceService = useDependency(IUniverInstanceService);
    const permissionService = useDependency(IPermissionService);
    const unitId = instanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getUnitId();
    const permissionId = new WorkbookEditablePermission(unitId ?? '').id;
    const permission = useObservable(
        permissionService.getPermissionPoint$(permissionId) ?? of(undefined),
        undefined,
        true
    );

    return !!unitId && permission?.value !== false;
}
