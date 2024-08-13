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
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType, useDependency } from '@univerjs/core';
import type { RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useObservable } from '@univerjs/ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ActivateSlidePageOperation, AppendSlideOperation, SetSlidePageThumbOperation } from '@univerjs/slides-ui';
import { IncreaseSingle } from '@univerjs/icons';

import styles from './index.module.less';

/**
 * This components works as the root component of the left Sidebar of Slide.
 */

export function UniSlideSideBar() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const renderManagerService = useDependency(IRenderManagerService);
    const localeService = useDependency(LocaleService);

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
    const [activatePageId, setActivatePageId] = useState<string | null>(pageOrder[0]);
    const [barHeight, setBarHeight] = useState(0);

    useEffect(() => {
        setDivRefs(slideList.map((_) => React.createRef()));
    }, [slideList.length]);

    useEffect(() => {
        const subscriber = currentSlide?.activePage$.subscribe((page) => {
            const id = page?.id ?? null;

            id && setActivatePageId(id);
        });

        return () => {
            subscriber?.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        divRefs.forEach((ref, index) => {
            if (ref.current) {
                const slide = slideList[index];
                renderManagerService.getRenderById(slide.id)?.engine.setContainer(ref.current);
            }
        });

        if (divRefs.length > 0) {
            commandService.syncExecuteCommand(SetSlidePageThumbOperation.id, {
                unitId: currentSlide?.getUnitId(),
            });
        }
    }, [divRefs, commandService, renderManagerService, slideList, currentSlide]); // 依赖于divRefs数组的变化

    useEffect(() => {
        const slideBar = slideBarRef.current;
        if (slideBar) {
            setBarHeight(slideBar.clientHeight - 38);
        }
    }, []);

    const activatePage = useCallback((page: string) => {
        commandService.syncExecuteCommand(ActivateSlidePageOperation.id, { id: page, unitId: currentSlide?.getUnitId() });
    }, [commandService, currentSlide]);

    const handleAppendSlide = useCallback(() => {
        commandService.syncExecuteCommand(AppendSlideOperation.id, { unitId: currentSlide?.getUnitId() });
    }, [commandService, currentSlide]);

    return (
        <div className={styles.uniSlideBar} ref={slideBarRef}>
            <div className={styles.uniSlideBarContent} style={{ height: `${barHeight}px` }}>
                {slideList.map((item, index) => (
                    <div
                        key={item.id}
                        className={clsx(styles.uniSlideBarItem, {
                            [styles.uniSlideBarItemActive]: item.id === activatePageId,
                        })}
                        onClick={() => activatePage(item.id)}
                    >
                        <span>{index + 1}</span>
                        <div ref={divRefs[index]} className={styles.uniSlideBarBox} />
                    </div>
                ))}
            </div>
            <button className={styles.newSlideButton} onClick={handleAppendSlide}>
                <IncreaseSingle className={styles.newSlideButtonIcon} />
                <span>{localeService.t('slide.append')}</span>
            </button>
        </div>
    );
}
