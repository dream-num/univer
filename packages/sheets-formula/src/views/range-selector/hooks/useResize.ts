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

import { DocSkeletonManagerService } from '@univerjs/docs';
import { useEffect } from 'react';
import type { Editor } from '@univerjs/docs-ui';

export const useResize = (editor?: Editor) => {
    const resize = () => {
        if (editor) {
            const { scene, mainComponent } = editor.render;
            const docSkeletonManagerService = editor.render.with(DocSkeletonManagerService);
            const { width, height } = editor.getBoundingClientRect();

            docSkeletonManagerService.getViewModel().getDataModel().updateDocumentDataPageSize(Infinity);
            scene.transformByState({
                width,
                height,
            });

            mainComponent?.resize(width, height);
        }
    };

    useEffect(() => {
        if (editor) {
            const time = setTimeout(() => {
                resize();
            }, 500);
            return () => {
                clearTimeout(time);
            };
        }
    }, [editor]);
    return resize;
};
