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

import type { ICommand, IWorkbookData, Univer, Workbook } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { ILocalFileService } from '@univerjs/ui';

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        univer?: Univer;
        univerAPI?: ReturnType<typeof FUniver.newAPI>;
    }
}

export const DisposeUniverCommand: ICommand = {
    id: 'debugger.command.dispose-unit',
    type: CommandType.COMMAND,
    handler: () => {
        window.univer?.dispose();
        window.univer = undefined;
        window.univerAPI = undefined;
        return true;
    },
};

export const DisposeCurrentUnitCommand: ICommand = {
    id: 'debugger.command.dispose-current-unit',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const focused = univerInstanceService.getFocusedUnit();
        if (!focused) return false;

        return univerInstanceService.disposeUnit(focused.getUnitId());
    },
};

export const CreateEmptySheetCommand: ICommand = {
    id: 'debugger.command.create-empty-sheet',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        univerInstanceService.createUnit(UniverInstanceType.UNIVER_SHEET, {});
        return true;
    },
};

export const LoadSheetSnapshotCommand: ICommand = {
    id: 'debugger.command.load-sheet-snapshot',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const fileOpenerService = accessor.get(ILocalFileService);
        const snapshotFile = await fileOpenerService.openFile({ multiple: false, accept: '.json' });
        if (snapshotFile.length !== 1) return false;

        const text = await snapshotFile[0].text();
        const instanceService = accessor.get(IUniverInstanceService);
        instanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, JSON.parse(text));
        return true;
    },
};
