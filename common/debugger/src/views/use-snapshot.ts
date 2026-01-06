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
import type { DocumentDataModel, IStyleData, IWorkbookData, Workbook } from '@univerjs/core';
import { IResourceLoaderService, IUniverInstanceService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';
import { ILocalFileService, useDependency } from '@univerjs/ui';
import { RecordController } from '../controllers/local-save/record.controller';

const menu = [
    {
        label: 'Save workbook',
        value: 'workbook',
    },
    {
        label: 'Save worksheet',
        value: 'sheet',
    },
    {
        label: 'Record',
        value: 'record',
    },
    {
        label: 'Load snapshot',
        value: 'load',
    },
];

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

export function useSnapshot() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const resourceLoaderService = useDependency(IResourceLoaderService);
    const localFileService = useDependency(ILocalFileService);
    const recordController = useDependency(RecordController);

    const onSelect = async (value: string) => {
        const preName = new Date().toLocaleString();
        const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        if (!workbook) {
            const doc = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)!;
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

        if (value === 'sheet') {
            const sheetId = worksheet.getSheetId();
            const sheet = snapshot.sheets[sheetId];
            snapshot.sheets = { [sheetId]: sheet };
            snapshot.sheetOrder = [sheetId];
            const text = JSON.stringify(filterStyle(snapshot), null, 2);
            localFileService.downloadFile(new Blob([text]), `${preName} snapshot.json`);
        } else if (value === 'workbook') {
            const text = JSON.stringify(filterStyle(snapshot), null, 2);
            localFileService.downloadFile(new Blob([text]), `${preName} snapshot.json`);
        } else if (value === 'record') {
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
        } else if (value === 'load') {
            const snapshotFile = await localFileService.openFile({ multiple: false, accept: '.json' });
            if (snapshotFile.length !== 1) return false;

            const text = await snapshotFile[0].text();
            univerInstanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, JSON.parse(text));
            return true;
        }
    };

    return {
        type: 'subItem' as const,
        children: '📷 Snapshot',
        options: menu.map((item) => ({
            type: 'item' as const,
            children: item.label,
            onSelect: () => onSelect(item.value),
        })),
    };
}
