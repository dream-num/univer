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

import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingCommonPanel } from '@univerjs/drawing-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import { DocDrawingPosition } from './DocDrawingPosition';
import { DocDrawingTextWrap } from './DocDrawingTextWrap';

export const DocDrawingPanel = () => {
    const drawingManagerService = useDependency(IDrawingManagerService);
    const drawings = useObservable(
        () => drawingManagerService.focus$,
        drawingManagerService.getFocusDrawings(),
        false,
        [drawingManagerService]
    );

    return !!drawings?.length && (
        <div className="univer-text-sm">
            <DrawingCommonPanel drawings={drawings} hasAlign={false} hasCropper hasGroup={false} hasTransform={false} />
            <DocDrawingTextWrap drawings={drawings} />
            <DocDrawingPosition drawings={drawings} />
        </div>
    );
};
