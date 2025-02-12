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

import { Disposable } from '@univerjs/core';

import type { ILocalFileService, IOpenFileOptions } from './local-file.service';

export class DesktopLocalFileService extends Disposable implements ILocalFileService {
    openFile(options?: IOpenFileOptions): Promise<File[]> {
        return new Promise((resolve) => {
            const inputElement = document.createElement('input');
            inputElement.type = 'file';
            inputElement.accept = options?.accept ?? '';
            inputElement.multiple = options?.multiple ?? false;
            inputElement.onchange = (event) => {
                const fileList = (event.target as HTMLInputElement).files;
                if (fileList) {
                    resolve(Array.from(fileList));
                }
            };
            inputElement.click();
        });
    }

    downloadFile(data: Blob, fileName: string): void {
        const a = document.createElement('a');
        a.download = fileName;
        a.href = window.URL.createObjectURL(data);
        a.click();
    }
}
