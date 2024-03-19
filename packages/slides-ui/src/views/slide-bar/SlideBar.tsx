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

import { ICommandService, type ISlidePage, IUniverInstanceService } from '@univerjs/core';
import React, { useCallback, useRef } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useObservable } from '@univerjs/ui';
import { ActivateSlidePageOperation } from '../../commands/operations/activate.operation';
import styles from './index.module.less';

interface SlideBarState {
    slideList: ISlidePage[];
    activePageId?: string;
}

interface IProps {
    addSlide: () => void;
    activeSlide: (pageId: string) => void;
}

/**
 * This components works as the root component of the left Sidebar of Slide.
 */
export function SlideSideBar() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);

    const slideBarRef = useRef<HTMLDivElement>(null);
    const currentSlide = useObservable(univerInstanceService.currentSlide$);
    const pages = currentSlide?.getPages();
    const pageOrder = currentSlide?.getPageOrder();

    const isPageActivated = useCallback((page: string) => {
        return false;
    }, []);

    const activatePage = useCallback((page: string) => {
        commandService.syncExecuteCommand(ActivateSlidePageOperation.id, { id: page });
    }, [commandService]);

    if (!pages || !pageOrder) {
        return null;
    }

    const slideList = pageOrder.map((id) => pages[id]);

    return (
        <div className={styles.slideBar} ref={slideBarRef}>
            <div className={styles.slideBarContent}>
                {slideList.map((item, index) => (
                    <div
                        key={index}
                        className={`${styles.slideBarItem} ${isPageActivated(item.id)}`}
                        onClick={() => activatePage(item.id)}
                    >
                        <span>{index + 1}</span>
                        <div className={styles.slideBarBox} />
                    </div>
                ))}
            </div>
            {/* <div className={styles.slideAddButton}>
                    <Button onClick={addSlide}>+</Button>
                </div> */}
        </div>
    );
}
