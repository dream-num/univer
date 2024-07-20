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
import { Link } from 'react-router-dom';
import { DownSingle, FolderSingle, SaveSingle } from '@univerjs/icons';
import styles from './index.module.less';

interface TreeNode {
    title: string;
    link?: string;
    children?: TreeNode[];
}

interface TreeMenuProps {
    data: TreeNode[];
}

export const TreeMenu: React.FC<TreeMenuProps> = ({ data }) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const handleToggle = (name: string) => {
        setExpanded((prevState) => ({
            ...prevState,
            [name]: !prevState[name],
        }));
    };

    const renderTree = (nodes: TreeNode[], parentName: string = '') => {
        return nodes.map((node, index) => {
            const nodeName = parentName ? `${parentName}-${node.title}` : node.title;
            return (
                <li key={index}>
                    {node.children && node.children.length > 0
                        ? (
                            <>
                                <div onClick={() => handleToggle(nodeName)} className={styles.folder}>
                                    <span
                                        className={styles.arrow}
                                        style={{ transform: expanded[nodeName] ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                                    >
                                        <DownSingle />
                                    </span>
                                    <FolderSingle className={styles.icon} />
                                    {' '}
                                    {node.title}
                                </div>
                                {expanded[nodeName] && <ul>{renderTree(node.children, nodeName)}</ul>}
                            </>
                        )
                        : (
                            <Link to={node.link || '#'} className={styles.file}>
                                <span className={styles.arrowPlaceholder}></span>
                                <SaveSingle className={styles.icon} />
                                {' '}
                                {node.title}
                            </Link>
                        )}
                </li>
            );
        });
    };

    return <ul className={styles.treeMenu}>{renderTree(data)}</ul>;
};
