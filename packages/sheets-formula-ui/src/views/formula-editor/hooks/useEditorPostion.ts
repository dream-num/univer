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

import { IUniverInstanceService, useDependency } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { ISidebarService, useEvent } from '@univerjs/ui';
import { useEffect, useMemo } from 'react';
import { BehaviorSubject, throttleTime } from 'rxjs';
import useResizeScrollObserver from './useResizeScrollObserver';

export function useEditorPostion(editorId: string, ready: boolean, deps?: any[]) {
    const editorService = useDependency(IEditorService);
    const position$ = useMemo(() => new BehaviorSubject({ left: -999, top: -999, right: -999, bottom: -999 }), []);
    const sidebarService = useDependency(ISidebarService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const updatePosition = useEvent(() => {
        const doc = editorService.getEditor(editorId);
        if (!doc) {
            return;
        }
        const position = doc.getBoundingClientRect();
        const { left, top, right, bottom } = position;
        const current = position$.getValue();
        if (current.left === left && current.top === top && current.right === right && current.bottom === bottom) {
            return;
        }
        position$.next({ left: left - 1, right: right + 1, top: top - 1, bottom: bottom + 1 });
        return position;
    });

    useEffect(() => {
        if (!ready) {
            return;
        }
        updatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editorId, editorService, univerInstanceService.unitAdded$, updatePosition, ready, ...(deps ?? [])]);

    useResizeScrollObserver(updatePosition);

    useEffect(() => {
        const sidebarSubscription = sidebarService.scrollEvent$.pipe(throttleTime(100)).subscribe(updatePosition);

        return () => {
            sidebarSubscription.unsubscribe();
        };
    }, []);

    return [position$, updatePosition] as const;
}
