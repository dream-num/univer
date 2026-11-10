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

import type { DocumentDataModel } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { Slider, useDependency, useObservable } from '@univerjs/ui';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import { DOC_ZOOM_SHORTCUTS, getDocZoomRatio$ } from '../../services/doc-zoom';

const DOC_ZOOM_RANGE = [10, 400];

export function ZoomSlider() {
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const zoom = useObservable(
        () => getDocZoomRatio$(commandService, univerInstanceService),
        100,
        undefined,
        [commandService, univerInstanceService]
    );

    function handleChange(value: number) {
        const documentDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (documentDataModel == null) {
            return;
        }

        return commandService.executeCommand(SetDocZoomRatioOperation.id, {
            unitId: documentDataModel.getUnitId(),
            zoomRatio: value / 100,
        });
    }

    return (
        <Slider
            min={DOC_ZOOM_RANGE[0]}
            value={zoom}
            shortcuts={DOC_ZOOM_SHORTCUTS}
            onChange={handleChange}
        />
    );
}
