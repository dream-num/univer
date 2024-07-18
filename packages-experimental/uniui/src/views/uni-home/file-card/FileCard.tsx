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
import styles from './index.module.less';

interface FileCardProps {
    icon: string;
    title: string;
    description: string;
    collaborators: string[];
    pages: number;
    lastModified: string;
}

export const FileCard: React.FC<FileCardProps> = ({ icon, title, description, collaborators, pages, lastModified }) => {
    return (
        <div className={styles.fileCard}>
            <div className={styles.fileCardHeader}>
                <span className={styles.fileIcon}>{icon}</span>
                <span className={styles.fileTitle}>{title}</span>
            </div>
            <div className={styles.fileDescription}>{description}</div>
            <div className={styles.fileCollaborators}>
                {collaborators.map((collaborator, index) => (
                    <img key={index} src={collaborator} alt="Collaborator" className={styles.collaboratorAvatar} />
                ))}
            </div>
            <div className={styles.fileFooter}>
                <span className={styles.filePages}>
                    {pages}
                    {' '}
                    page
                    {pages > 1 ? 's' : ''}
                </span>
                <span className={styles.fileLastModified}>{lastModified}</span>
            </div>
        </div>
    );
};
