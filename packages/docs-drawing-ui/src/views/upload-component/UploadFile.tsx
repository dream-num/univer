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

import { ICommandService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useRef } from 'react';
import { DRAWING_IMAGE_ALLOW_IMAGE_LIST } from '@univerjs/drawing';
import { InsertDocImageOperation } from '../../commands/operations/insert-image.operation';
import styles from './index.module.less';

export const UploadFileMenu = () => {
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

        commandService.executeCommand(InsertDocImageOperation.id, { files });

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
