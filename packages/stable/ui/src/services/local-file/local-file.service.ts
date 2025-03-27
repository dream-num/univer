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

import { createIdentifier } from '@univerjs/core';

export interface IOpenFileOptions {
    accept?: string;
    multiple?: boolean;
}

/**
 * This service is used to upload files.
 */
export const ILocalFileService = createIdentifier<ILocalFileService>('univer-ui.local-file.service');
export interface ILocalFileService {
    openFile(options?: IOpenFileOptions): Promise<File[]>;
    downloadFile(data: Blob, fileName: string): void;
}
