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

import type { DocumentDataModel, ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { ISetDocZoomRatioOperationParams } from '../commands/operations/set-doc-zoom-ratio.operation';
import { DocumentFlavor, UniverInstanceType } from '@univerjs/core';
import { distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { SetDocZoomRatioOperation } from '../commands/operations/set-doc-zoom-ratio.operation';

const DEFAULT_DOC_ZOOM_RATIO = 1;
export const DEFAULT_MODERN_DOC_ZOOM_RATIO = 1;
export const DOC_ZOOM_SHORTCUTS = [50, 80, 100, 130, 150, 170, 200, 400];

type DocZoomSource = Pick<DocumentDataModel, 'getSettings' | 'getSnapshot'>;

export function getDocEffectiveZoomRatio(documentModel: DocZoomSource): number {
    const zoomRatio = documentModel.getSettings()?.zoomRatio;
    if (zoomRatio != null) {
        return zoomRatio;
    }

    const documentFlavor = documentModel.getSnapshot().documentStyle?.documentFlavor;
    return documentFlavor === DocumentFlavor.MODERN
        ? DEFAULT_MODERN_DOC_ZOOM_RATIO
        : DEFAULT_DOC_ZOOM_RATIO;
}

export function getDocZoomRatio$(commandService: ICommandService, instanceService: IUniverInstanceService) {
    return instanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).pipe(
        switchMap((documentModel) => {
            if (!documentModel) {
                return of(100);
            }

            return new Observable<number>((subscriber) => {
                const update = () => subscriber.next(Math.round(getDocEffectiveZoomRatio(documentModel) * 100));
                const disposable = commandService.onCommandExecuted((command) => {
                    if (command.id === SetDocZoomRatioOperation.id &&
                        (command.params as ISetDocZoomRatioOperationParams).unitId === documentModel.getUnitId()) {
                        update();
                    }
                });
                update();
                return () => disposable.dispose();
            });
        }),
        distinctUntilChanged()
    );
}
