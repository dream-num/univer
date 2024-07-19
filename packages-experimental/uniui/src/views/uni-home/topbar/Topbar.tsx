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

import React, { useState } from 'react';
import { DetailsSingle, IncreaseSingle, Progress50Single, SearchSingle16, UploadSingle } from '@univerjs/icons';
import Button from '../../../components/button/Button';
import styles from './index.module.less';

export const Topbar: React.FC = () => {
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (darkMode) {
            document.body.classList.remove('dark-mode');
        } else {
            document.body.classList.add('dark-mode');
        }
    };

    return (
        <div className={styles.topbar}>
            <div className={styles.searchContainer}>
                <SearchSingle16 className={styles.searchIcon} />
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search For File Name, Creation Time, Creator"
                />
                <span className={styles.shortcutHint}>
                    <kbd>⌘</kbd>
                    {' '}
                    +
                    <kbd>K</kbd>
                </span>
            </div>
            <div className={styles.topbarActions}>
                <Button type="primary">
                    <IncreaseSingle className={styles.topbarActionsButtonIcon} />
                    <span className={styles.topbarActionsNew}>New</span>
                </Button>
                <Button type="default">
                    <UploadSingle className={styles.topbarActionsButtonIcon} />
                    Upload
                </Button>
                <div className={styles.topbarActionsIcon}><Progress50Single /></div>
                <div className={styles.topbarActionsIcon}><DetailsSingle /></div>
                <img src="./assets/images/avatar.png" alt="User Avatar" className={styles.avatar} />
            </div>
        </div>
    );
};
