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

/* eslint-disable node/prefer-global/process */
import type { ICommand, IStyleData, IWorkbookData, Workbook } from '@univerjs/core';
import { CommandType, IResourceLoaderService, IUniverInstanceService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { RecordController } from '../../controllers/local-save/record.controller';
import { ExportController } from '../../controllers/local-save/export.controller';

export interface ISaveSnapshotParams {
    value: 'sheet' | 'workbook' | 'record';
}

const filterStyle = (workbookData: IWorkbookData) => {
    const sheets = workbookData.sheets;
    const cacheStyle: Record<string, IStyleData> = {};
    Object.keys(sheets).forEach((sheetId) => {
        const sheet = sheets[sheetId];
        new ObjectMatrix(sheet.cellData).forValue((_r, _c, value) => {
            const s = value?.s;
            if (s && typeof s === 'string') {
                const style = workbookData.styles[s];
                if (style) {
                    cacheStyle[s] = style;
                }
            }
        });
    });
    workbookData.styles = cacheStyle;
    return workbookData;
};
export const SaveSnapshotOptions: ICommand = {
    id: 'debugger.operation.saveSnapshot',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: ISaveSnapshotParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const resourceLoaderService = accessor.get(IResourceLoaderService);
        const exportController = accessor.get(ExportController);
        const recordController = accessor.get(RecordController);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        const snapshot = resourceLoaderService.saveWorkbook(workbook);
        const gitHash = process.env.GIT_COMMIT_HASH;
        const gitBranch = process.env.GIT_REF_NAME;
        const buildTime = process.env.BUILD_TIME;
        (snapshot as any).__env__ = { gitHash, gitBranch, buildTime };
        const preName = new Date().toLocaleString();
        switch (params.value) {
            case 'sheet': {
                const sheetId = worksheet.getSheetId();
                const sheet = snapshot.sheets[sheetId];
                snapshot.sheets = { [sheetId]: sheet };
                snapshot.sheetOrder = [sheetId];
                const text = JSON.stringify(filterStyle(snapshot), null, 2);
                exportController.exportJson(text, `${preName} snapshot`);
                break;
            }

            case 'workbook': {
                const text = JSON.stringify(filterStyle(snapshot), null, 2);
                exportController.exportJson(text, `${preName} snapshot`);

                break;
            }
            case 'record': {
                let endCommands = () => [];

                recordController.record().subscribe((v) => {
                    if (v.type === 'start') {
                        endCommands = recordController.startSaveCommands() as any;
                    }
                    if (v.type === 'finish') {
                        const commands = endCommands();
                        exportController.exportWebm(v.data, `${preName} video`);
                        const commandsText = JSON.stringify(commands, null, 2);
                        exportController.exportJson(commandsText, `${preName} commands`);
                    }
                });
            }
        }
        return true;
    },
};
