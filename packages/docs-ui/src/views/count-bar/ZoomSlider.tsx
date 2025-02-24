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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';

const ZOOM_MAP = [50, 80, 100, 130, 150, 170, 200, 400];
const DOC_ZOOM_RANGE = [10, 400];

export function ZoomSlider() {
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const currentDoc$ = useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC), []);
    const documentDataModel = useObservable(currentDoc$);

    const getCurrentZoom = useCallback(() => {
        if (!documentDataModel) return 100;

        const currentZoom = ((documentDataModel.getSettings()?.zoomRatio ?? 1) * 100);
        return Math.round(currentZoom);
    }, [documentDataModel]);

    const [zoom, setZoom] = useState(() => getCurrentZoom());

    useEffect(() => {
        setZoom(getCurrentZoom());

        const disposable = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetDocZoomRatioOperation.id) {
                const currentZoom = getCurrentZoom();
                setZoom(currentZoom);
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
