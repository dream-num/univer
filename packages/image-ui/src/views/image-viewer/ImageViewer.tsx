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

import type { IDrawingSearch, Nullable } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, toDisposable } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import { Autofill, MoreDownSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { RemoveImageMutation } from '@univerjs/image';
import styles from './index.module.less';


export interface IImageViewerProps {
    src: Nullable<string>;
}

export const ImageViewer: React.FC<IImageViewerProps> = (props: IImageViewerProps) => {
    const { src } = props;

    if (!src) {
        return null;
    }

    return (
        <div>
            <img src={src} alt="Univer Image Viewer" style={{ width: '100%', height: '100%', position: 'relative' }} />
        </div>
    );
};
