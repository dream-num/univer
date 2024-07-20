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

import React from 'react';
import { Doc, FolderSingle, MoreHorizontalSingle, SaveSingle, Slide, UnorderSingle, Xlsx } from '@univerjs/icons';
import { useDependency } from '@univerjs/core';
import { UnitFilesService, UnitType } from '../../../services/unit-home/unit-files.service';
import styles from './index.module.less';

const IconMap = {
    [UnitType.FOLDER]: <FolderSingle />,
    [UnitType.PROJECT]: <SaveSingle />,
    [UnitType.SLIDE]: <Slide />,
    [UnitType.DOC]: <Doc />,
    [UnitType.SHEET]: <Xlsx />,
    [UnitType.MIND_MAP]: <SaveSingle />,
    [UnitType.BOARD]: <SaveSingle />,
};

export const RecentFiles: React.FC = () => {
    const unitFilesService = useDependency(UnitFilesService);
    const unitFiles = unitFilesService.getUnitFiles();

    return (
        <div className={styles.recentFiles}>
            <h2>Recent Files</h2>
            <div className={styles.fileListTitle}>
                <span className={styles.fileName}>
                    <input className={styles.fileCheck} type="checkbox" />
                    Name
                </span>
                <span className={styles.fileOwner}>Owner</span>
                <span className={styles.fileLastModified}>Last Modified</span>
                <UnorderSingle className={styles.fileOperation} />
            </div>
            <div className={styles.fileList}>
                {unitFiles.map((file, index) => (
                    <div key={index} className={styles.fileRow}>
                        <div className={styles.fileName}>
                            <input className={styles.fileCheck} type="checkbox" />
                            <span className={styles.fileIcon}>{file.icon || IconMap[file.type]}</span>
                            <span className={styles.fileTitle}>{file.title}</span>
                        </div>
                        <div className={styles.fileOwner}>{file.owner}</div>
                        <div className={styles.fileLastModified}>{file.lastModified}</div>
                        <MoreHorizontalSingle className={styles.fileOperation} />
                    </div>
                ))}
            </div>
        </div>
    );
};
