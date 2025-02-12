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

/* eslint-disable node/prefer-global/process */

import { CommandType, IResourceLoaderService, IUniverInstanceService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';
import { ILocalFileService } from '@univerjs/ui';
import type { DocumentDataModel, IAccessor, ICommand, IStyleData, IWorkbookData, Workbook } from '@univerjs/core';
import { RecordController } from '../../controllers/local-save/record.controller';

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
        const localFileService = accessor.get(ILocalFileService);
        const recordController = accessor.get(RecordController);

        const preName = new Date().toLocaleString();
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        if (!workbook) {
            const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)!;
            const snapshot = resourceLoaderService.saveUnit(doc.getUnitId());

            if (process.env.NODE_ENV === 'production') {
                const gitHash = process.env.GIT_COMMIT_HASH;
                const gitBranch = process.env.GIT_REF_NAME;
                const buildTime = process.env.BUILD_TIME;
                (snapshot as any).__env__ = { gitHash, gitBranch, buildTime };
            }
            const text = JSON.stringify(snapshot, null, 2);
            localFileService.downloadFile(new Blob([text]), `${preName} snapshot.json`);
            return true;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }
        const snapshot = resourceLoaderService.saveUnit<ReturnType<typeof workbook.getSnapshot>>(workbook.getUnitId())!;

        if (process.env.NODE_ENV === 'production') {
            const gitHash = process.env.GIT_COMMIT_HASH;
            const gitBranch = process.env.GIT_REF_NAME;
            const buildTime = process.env.BUILD_TIME;
            (snapshot as any).__env__ = { gitHash, gitBranch, buildTime };
        }

        switch (params.value) {
            case 'sheet': {
                const sheetId = worksheet.getSheetId();
                const sheet = snapshot.sheets[sheetId];
                snapshot.sheets = { [sheetId]: sheet };
                snapshot.sheetOrder = [sheetId];
                const text = JSON.stringify(filterStyle(snapshot), null, 2);
                localFileService.downloadFile(new Blob([text]), `${preName} snapshot.json`);
                break;
            }

            case 'workbook': {
                const text = JSON.stringify(filterStyle(snapshot), null, 2);
                localFileService.downloadFile(new Blob([text]), `${preName} snapshot.json`);

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
                        localFileService.downloadFile(v.data, `${preName} video.webm`);
                        localFileService.downloadFile(new Blob([JSON.stringify(commands, null, 2)]), `${preName} commands.json`);
                    }
                });
            }
        }
        return true;
    },
};
