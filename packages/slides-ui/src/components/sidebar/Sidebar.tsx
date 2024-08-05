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

import type { Nullable, SlideDataModel } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import { type BaseObject, ObjectType } from '@univerjs/engine-render';
import { CanvasView } from '@univerjs/slides';
import React from 'react';
import ArrangePanel from '../panels/ArrangePanel';
import TransformPanel from '../panels/TransformPanel';
import FillPanel from '../panels/FillPanel';
import styles from './index.module.less';

export const COMPONENT_SLIDE_SIDEBAR = 'COMPONENT_SLIDE_SIDEBAR';

export default function RectSidebar() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const canvasView = useDependency(CanvasView);

    const currentSlide = univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);
    const pageId = currentSlide?.getActivePage()?.id;

    if (!pageId) return null;

    const page = canvasView.getRenderUnitByPageId(pageId);
    const transformer = page.scene?.getTransformer();

    if (!transformer) return null;

    const selectedObjects = transformer.getSelectedObjectMap();

    const object = selectedObjects.values().next().value as Nullable<BaseObject>;
    if (!object) {
        return null;
    }

    return (
        <section className={styles.imageCommonPanel}>
            <ArrangePanel unitId={pageId} />
            <TransformPanel unitId={pageId} />
            {object.objectType === ObjectType.RECT && <FillPanel unitId={pageId} />}
        </section>
    );
}
