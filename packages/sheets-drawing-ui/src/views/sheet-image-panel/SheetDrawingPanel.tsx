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

import type { IDrawingParam } from '@univerjs/core';
import { useDependency } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingCommonPanel } from '@univerjs/drawing-ui';
import React, { useEffect, useState } from 'react';
import styles from './index.module.less';
import { SheetDrawingAnchor } from './SheetDrawingAnchor';

export const SheetDrawingPanel = () => {
    const drawingManagerService = useDependency(IDrawingManagerService);
    const focusDrawings = drawingManagerService.getFocusDrawings();

    const [drawings, setDrawings] = useState<IDrawingParam[]>(focusDrawings);

    useEffect(() => {
        const focusDispose = drawingManagerService.focus$.subscribe((drawings) => {
            setDrawings(drawings);
        });

        return () => {
            focusDispose.unsubscribe();
        };
    }, []);

    return !!drawings?.length && (
        <div className={styles.imageCommonPanel}>
            <DrawingCommonPanel drawings={drawings} />
            <SheetDrawingAnchor drawings={drawings} />
        </div>
    );
};

