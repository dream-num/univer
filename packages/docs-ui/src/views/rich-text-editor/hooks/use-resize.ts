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

import type { Nullable } from '@univerjs/core';
import type { Editor } from '../../../services/editor/editor';
import { debounce } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { ScrollBar } from '@univerjs/engine-render';
import { useCallback, useEffect, useMemo } from 'react';
import { VIEWPORT_KEY } from '../../../basics/docs-view-key';

// eslint-disable-next-line max-lines-per-function
export const useResize = (editor?: Editor, isSingle = true, autoScrollbar?: boolean, autoScroll?: boolean) => {
    const resize = useCallback(() => {
        if (editor) {
            const { scene, mainComponent } = editor.render;
            const docSkeletonManagerService = editor.render.with(DocSkeletonManagerService);
            const { width, height } = editor.getBoundingClientRect();

            docSkeletonManagerService.getViewModel().getDataModel().updateDocumentDataPageSize(isSingle ? Infinity : width, Infinity);
            scene.transformByState({
                width,
                height,
            });

            mainComponent?.resize(width, height);
        }
    }, [editor, isSingle]);

    const checkScrollBar = useMemo(() => {
        // eslint-disable-next-line complexity
        return debounce(() => {
            if (!autoScrollbar) return;
            if (!editor || !autoScrollbar) {
                return;
            }

            const docSkeletonManagerService = editor.render.with(DocSkeletonManagerService);
            const skeleton = docSkeletonManagerService.getSkeleton();
            const { scene, mainComponent } = editor.render;
            const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
            const { actualWidth, actualHeight } = skeleton.getActualSize();
            const { width, height } = editor.getBoundingClientRect();
            let scrollBar = viewportMain?.getScrollBar() as Nullable<ScrollBar>;
            const contentWidth = Math.max(actualWidth, width);
            const contentHeight = Math.max(actualHeight, height);

            scene.transformByState({
                width: contentWidth,
                height: contentHeight,
            });

            mainComponent?.resize(contentWidth, contentHeight);
            if (!isSingle) {
                if (actualHeight > height) {
                    if (scrollBar == null) {
                        if (viewportMain) {
                            scrollBar = new ScrollBar(viewportMain, {
                                enableHorizontal: false,
                                enableVertical: true,
                                barSize: 8,
                                minThumbSizeV: 8,
                            });
                        }
                    } else {
                        viewportMain?.resetCanvasSizeAndUpdateScroll();
                    }
                    autoScroll && viewportMain?.scrollToBarPos({ x: 0, y: Infinity });
                } else {
                    scrollBar = null;
                    viewportMain?.scrollToBarPos({ x: 0, y: 0 });
                    viewportMain?.getScrollBar()?.dispose();
                }
            } else {
                if (actualWidth > width) {
                    if (scrollBar == null) {
                        viewportMain && new ScrollBar(viewportMain, {
                            barSize: 8,
                            enableVertical: false,
                            enableHorizontal: true,
                            minThumbSizeV: 8,
                        });
                    } else {
                        viewportMain?.resetCanvasSizeAndUpdateScroll();
                    }
                    autoScroll && viewportMain?.scrollToBarPos({ x: Infinity, y: 0 });
                } else {
                    scrollBar = null;
                    viewportMain?.scrollToBarPos({ x: 0, y: 0 });
                    viewportMain?.getScrollBar()?.dispose();
                }
            }
        }, 30);
    }, [editor, autoScrollbar, isSingle, autoScroll]);

    useEffect(() => {
        if (!autoScrollbar) return;
        if (editor) {
            const time = setTimeout(() => {
                resize();
                checkScrollBar();
            }, 500);
            return () => {
                clearTimeout(time);
            };
        }
    }, [editor, autoScrollbar, resize, checkScrollBar]);

    useEffect(() => {
        if (!autoScrollbar) return;
        if (editor) {
            const d = editor.input$.subscribe(() => {
                checkScrollBar();
            });
            return () => {
                d.unsubscribe();
            };
        }
    }, [editor, autoScrollbar, checkScrollBar]);

    return { resize, checkScrollBar };
};
