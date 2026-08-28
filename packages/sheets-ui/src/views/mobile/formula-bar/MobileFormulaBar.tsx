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

import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    FOCUSING_FX_BAR_EDITOR,
    IContextService,
} from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { IEditorService } from '@univerjs/docs-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { map } from 'rxjs';
import { MOBILE_FX_EDITOR_EXPANDED } from '../../../consts/mobile-context';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { FormulaBar } from '../../formula-bar/FormulaBar';

export function MobileFormulaBar() {
    const editorBridgeService = useDependency(IEditorBridgeService);
    const contextService = useDependency(IContextService);
    const editorService = useDependency(IEditorService);
    const visible = useObservable(
        () => editorBridgeService.visible$.pipe(map((state) => state.visible)),
        false,
        false,
        [editorBridgeService]
    );

    useEffect(() => {
        if (!visible) return undefined;

        contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, true);
        const frame = requestAnimationFrame(() => {
            // The mobile formula editor is mounted lazily. Replay the selected cell after mount so
            // its current value is not lost when the earlier selection sync ran before this editor existed.
            editorBridgeService.refreshEditCellState();
            editorService.focus(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
        });
        return () => cancelAnimationFrame(frame);
    }, [contextService, editorBridgeService, editorService, visible]);

    if (!visible) {
        return null;
    }

    return <MobileFormulaBarEditor />;
}

function MobileFormulaBarEditor() {
    const contextService = useDependency(IContextService);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        return () => contextService.setContextValue(MOBILE_FX_EDITOR_EXPANDED, false);
    }, [contextService]);

    function handleExpandedChange(nextExpanded: boolean) {
        contextService.setContextValue(MOBILE_FX_EDITOR_EXPANDED, nextExpanded);
        setExpanded(nextExpanded);
    }

    return (
        <div
            data-u-comp="mobile-formula-bar"
            data-expanded={expanded}
            className={clsx(`
              univer-inset-x-0 univer-z-30 univer-bg-gray-0 univer-shadow-[0_-4px_16px_rgba(0,0,0,0.08)]
              dark:!univer-bg-gray-800
            `, expanded ? 'univer-fixed univer-top-0 univer-z-50' : 'univer-absolute')}
            style={{
                bottom: 'var(--univer-mobile-keyboard-inset, 0px)',
                paddingBottom: expanded ? undefined : 'env(safe-area-inset-bottom, 0px)',
                paddingTop: expanded ? 'env(safe-area-inset-top, 0px)' : undefined,
            }}
        >
            <FormulaBar
                className="
                  univer-text-base
                  [&>div:first-child]:!univer-hidden
                  [&_span]:!univer-min-h-8 [&_span]:!univer-min-w-8
                "
                disableDefinedName
                expanded={expanded}
                mobile
                onExpandedChange={handleExpandedChange}
            />
        </div>
    );
}
