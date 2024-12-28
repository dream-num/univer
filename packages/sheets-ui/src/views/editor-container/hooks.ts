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

import { IUniverInstanceService, useDependency, useObservable } from '@univerjs/core';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { KeyCode } from '@univerjs/ui';
import { useMemo } from 'react';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

export function useKeyEventConfig(isRefSelecting: React.MutableRefObject<0 | 1 | 2>, unitId: string) {
    const editorBridgeService = useDependency(IEditorBridgeService);

    const keyCodeConfig = useMemo(() => ({
        keyCodes: [
            { keyCode: KeyCode.ENTER },
            { keyCode: KeyCode.ESC },
            { keyCode: KeyCode.TAB },
        ],
        handler: (keycode: KeyCode) => {
            if (keycode === KeyCode.ENTER || keycode === KeyCode.ESC || keycode === KeyCode.TAB) {
                editorBridgeService.disableForceKeepVisible();
                editorBridgeService.changeVisible({
                    visible: false,
                    eventType: DeviceInputEventType.Keyboard,
                    keycode,
                    unitId: unitId!,
                });
            }
        },
    }), [editorBridgeService, unitId]);

    return keyCodeConfig;
}

export function useIsFocusing(editorId: string) {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const docSelectionRenderService = renderManagerService.getRenderById(editorId)?.with(DocSelectionRenderService);
    useObservable(docSelectionRenderService?.onBlur$);
    useObservable(docSelectionRenderService?.onFocus$);

    // useEffect(() => {
    //     if (docSelectionRenderService?.isFocusing) {
    //         univerInstanceService.focusUnit(editorId);
    //     }
    // }, [docSelectionRenderService?.isFocusing, editorId, univerInstanceService]);

    return docSelectionRenderService?.isFocusing;
}
