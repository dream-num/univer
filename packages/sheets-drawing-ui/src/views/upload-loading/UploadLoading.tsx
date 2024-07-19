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

import { LocaleService, useDependency } from '@univerjs/core';
import React, { useEffect } from 'react';
import { IImageIoService } from '@univerjs/drawing';

import styles from './index.module.less';

export const UploadLoading = () => {
    const imageIoService = useDependency(IImageIoService);
    const localeService = useDependency(LocaleService);

    const [remain, setRemain] = React.useState(0);

    useEffect(() => {
        const sub = imageIoService.change$.subscribe((count) => {
            setRemain(count);
        });

        return () => {
            sub.unsubscribe();
        };
    }, [imageIoService]);

    return (
        <div style={{ display: remain > 0 ? 'block' : 'none' }} className={styles.uploadLoading}>
            <div className={styles.uploadLoadingBody}>
                <div className={styles.uploadLoadingBodyAnimation}></div>
                <div className={styles.uploadLoadingBodyText}>{`${localeService.t('uploadLoading.loading')}: ${remain}` }</div>
            </div>
        </div>
    );
};
