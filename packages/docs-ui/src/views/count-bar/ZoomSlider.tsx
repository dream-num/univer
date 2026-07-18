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
import { useCallback, useEffect, useState } from 'react';
import { filter } from 'rxjs';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import { getDocEffectiveZoomRatio } from '../../services/doc-zoom';

const ZOOM_MAP = [50, 80, 100, 130, 150, 170, 200, 400];
const DOC_ZOOM_RANGE = [10, 400];

export function ZoomSlider() {
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const documentDataModel = useObservable(
        () => univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).pipe(
            filter((documentDataModel): documentDataModel is DocumentDataModel => documentDataModel != null)
        ),
        null,
        false,
        [univerInstanceService]
    );
    const getCurrentZoom = useCallback((docModel: DocumentDataModel | null = documentDataModel) => {
        if (!docModel) return 100;
        return Math.round(getDocEffectiveZoomRatio(docModel) * 100);
    }, [documentDataModel]);
    const [zoom, setZoom] = useState(100);

    useEffect(() => setZoom(getCurrentZoom(documentDataModel)), [documentDataModel, getCurrentZoom]);

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetDocZoomRatioOperation.id) {
                setZoom(getCurrentZoom());
            }
        });
        return disposable.dispose;
    }, [commandService, getCurrentZoom]);

    function handleChange(value: number) {
        setZoom(value);
        if (documentDataModel == null) {
            return;
        }

        const zoomRatio = value / 100;

        commandService.executeCommand(SetDocZoomRatioOperation.id, {
            unitId: documentDataModel.getUnitId(),
            zoomRatio,
        });
    }

    return (
        <Slider
            min={DOC_ZOOM_RANGE[0]}
            value={zoom}
            shortcuts={ZOOM_MAP}
            onChange={handleChange}
        />
    );
}
