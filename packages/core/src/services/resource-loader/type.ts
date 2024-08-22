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

import { createIdentifier } from '../../common/di';
import type { Workbook } from '../../sheets/workbook';
import { LifecycleStages, runOnLifecycle } from '../lifecycle/lifecycle';
import type { IDocumentData } from '../../types/interfaces';
import type { DocumentDataModel } from '../../docs';
import type { IWorkbookData } from '../../sheets/typedef';

export interface IResourceLoaderService {
    saveWorkbook: (workbook: Workbook) => IWorkbookData;
    saveDoc: (doc: DocumentDataModel) => IDocumentData;
}
export const IResourceLoaderService = createIdentifier<IResourceLoaderService>('resource-loader-service');
runOnLifecycle(LifecycleStages.Ready, IResourceLoaderService);
