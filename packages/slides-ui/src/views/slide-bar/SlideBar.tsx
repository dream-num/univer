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

import type { SlideDataModel } from '@univerjs/core';
import clsx from 'clsx';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useObservable } from '@univerjs/ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ActivateSlidePageOperation } from '../../commands/operations/activate.operation';
import { SetSlidePageThumbOperation } from '../../commands/operations/setThumb.operation';
import styles from './index.module.less';

/**
 * This components works as the root component of the left Sidebar of Slide.
 */

export function SlideSideBar() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const renderManagerService = useDependency(IRenderManagerService);

    const slideBarRef = useRef<HTMLDivElement>(null);
    const currentSlide = useObservable(
        () => univerInstanceService.getCurrentTypeOfUnit$<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE),
        undefined,
        undefined,
        []
    );
    const pages = currentSlide?.getPages();
    const pageOrder = currentSlide?.getPageOrder();

    if (!pages || !pageOrder) {
        return null;
    }

    const slideList = pageOrder.map((id) => pages[id]);

    const [divRefs, setDivRefs] = useState<RefObject<HTMLDivElement>[]>([]);

    useEffect(() => {
        setDivRefs(slideList.map((_) => React.createRef()));
    }, [slideList.length]);

    useEffect(() => {
        divRefs.forEach((ref, index) => {
            if (ref.current) {
                const slide = slideList[index];
                renderManagerService.getRenderById(slide.id)?.engine.setContainer(ref.current);
            }
        });

        if (divRefs.length > 0) {
            commandService.syncExecuteCommand(SetSlidePageThumbOperation.id);
        }
    }, [divRefs]); // 依赖于divRefs数组的变化

    const activatePage = useCallback((page: string) => {
        commandService.syncExecuteCommand(ActivateSlidePageOperation.id, { id: page });
    }, [commandService]);

    return (
        <div className={styles.slideBar} ref={slideBarRef}>
            <div className={styles.slideBarContent}>
                {slideList.map((item, index) => (
                    <div
                        key={index}
                        className={clsx(styles.slideBarItem, {
                            [styles.slideBarItemActive]: false, // TODO: If the slide is active, add the class slideBarItemActive
                        })}
                        onClick={() => activatePage(item.id)}
                    >
                        <span>{index + 1}</span>
                        <div ref={divRefs[index]} className={styles.slideBarBox} />
                    </div>
                ))}
            </div>
            {/* <div className={styles.slideAddButton}>
                    <Button onClick={addSlide}>+</Button>
                </div> */}
        </div>
    );
}
