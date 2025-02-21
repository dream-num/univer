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
import type { Editor, IRichTextEditorProps } from '@univerjs/docs-ui';

export interface IRangeSelectorInstance {
    editor: Nullable<Editor>;
    blur: () => void;
    focus: () => void;
    changePopupVisible: (visible: boolean) => void;
    verify: () => boolean;
}

export interface IRangeSelectorProps extends IRichTextEditorProps {
    unitId: string;
    subUnitId: string;
    maxRangeCount?: number;
    supportAcrossSheet?: boolean;
    selectorRef?: React.RefObject<IRangeSelectorInstance>;
    onVerify?: (res: boolean, rangeText: string) => void;
    onRangeSelectorDialogVisibleChange?: (visible: boolean) => void;
};
