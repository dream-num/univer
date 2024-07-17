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

import type { Nullable } from '@univerjs/core';
import { ICommandService, useDependency } from '@univerjs/core';
import React, { useRef } from 'react';
import type { ICustomComponentProps } from '@univerjs/ui';
import { DRAWING_IMAGE_ALLOW_IMAGE_LIST } from '@univerjs/drawing';
import { InsertCellImageOperation, InsertFloatImageOperation } from '../../commands/operations/insert-image.operation';
import styles from './index.module.less';
import { UploadFileType } from './component-name';

export interface IUploadFileProps extends ICustomComponentProps<Nullable<File>> {
    type: UploadFileType;
}

export const UploadFileMenu = (props: IUploadFileProps) => {
    const { type } = props;

    const commandService = useDependency(ICommandService);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const imageAccept = DRAWING_IMAGE_ALLOW_IMAGE_LIST.map((image) => `.${image.replace('image/', '')}`).join(',');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;

        if (fileList == null) {
            return;
        }

        const files: File[] = Array.from(fileList);

        if (type === UploadFileType.floatImage) {
            commandService.executeCommand(InsertFloatImageOperation.id, { files });
        } else if (type === UploadFileType.cellImage) {
            commandService.executeCommand(InsertCellImageOperation.id, { files });
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div onClick={handleButtonClick} className={styles.uploadFileMenu}>
            <input
                type="file"
                className={styles.uploadFileMenuInput}
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={imageAccept}
                multiple
            />
        </div>
    );
};
