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
import { createRoot } from 'react-dom/client';

import styles from './styles.module.less';

// package info
console.table({
    NODE_ENV: process.env.NODE_ENV,
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,
    GIT_REF_NAME: process.env.GIT_REF_NAME,
    BUILD_TIME: process.env.BUILD_TIME,
});

function Examples() {
    return (
        <section className={styles.examples}>
            <a className={styles.btn} href="./sheets/">
                <span> Univer Sheets</span>
                <div className={styles.btnBg}>→</div>{' '}
            </a>
            <a className={styles.btn} href="./docs/">
                <span> Univer Docs</span>
                <div className={styles.btnBg}>→</div>{' '}
            </a>
            <a className={styles.btn} href="./slides/">
                <span> Univer Slides</span>
                <div className={styles.btnBg}>→</div>{' '}
            </a>
            <a className={styles.btn} href="./sheets-multi/">
                <span> Univer Multi Instance</span>
                <div className={styles.btnBg}>→</div>{' '}
            </a>
            <a className={styles.btn} href="./uniscript/">
                <span> Uniscript</span>
                <div className={styles.btnBg}>→</div>{' '}
            </a>
        </section>
    );
}

createRoot(document.getElementById('app')!).render(<Examples />);
