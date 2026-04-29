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

import type { DocumentDataModel, IAccessor } from '@univerjs/core';
import { CommandType, ILogService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { docxToUniverData } from '@univerjs/docs-exchange';

export interface IDocxImportCommandParams {
    /**
     * Optional pre-fetched DOCX bytes. When omitted, the command opens a
     * native file picker to obtain the file from the user.
     */
    file?: ArrayBuffer | Uint8Array;
}

async function pickDocxFile(): Promise<ArrayBuffer | null> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        input.style.display = 'none';
        input.addEventListener('change', async () => {
            const file = input.files?.[0];
            input.remove();
            if (!file) {
                resolve(null);
                return;
            }
            resolve(await file.arrayBuffer());
        });
        input.addEventListener('cancel', () => {
            input.remove();
            resolve(null);
        });
        document.body.appendChild(input);
        input.click();
    });
}

export const DocxImportOperation = {
    id: 'docs-exchange.operation.docx-import',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params?: IDocxImportCommandParams) => {
        const logService = accessor.get(ILogService);
        const instanceService = accessor.get(IUniverInstanceService);

        const bytes = params?.file ?? await pickDocxFile();
        if (!bytes) return false;

        try {
            const data = await docxToUniverData(bytes);
            const unit = instanceService.createUnit<typeof data, DocumentDataModel>(
                UniverInstanceType.UNIVER_DOC,
                data
            );
            instanceService.focusUnit(unit.getUnitId());
            return true;
        } catch (err) {
            logService.error('[docs-exchange-ui] DOCX import failed:', err);
            return false;
        }
    },
};
