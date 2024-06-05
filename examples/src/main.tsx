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
import pkg from '../../package.json';

import styles from './styles.module.less';

// package info
// eslint-disable-next-line no-console
console.table({
    // eslint-disable-next-line node/prefer-global/process
    NODE_ENV: process.env.NODE_ENV,
    // eslint-disable-next-line node/prefer-global/process
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH,
    // eslint-disable-next-line node/prefer-global/process
    GIT_REF_NAME: process.env.GIT_REF_NAME,
    // eslint-disable-next-line node/prefer-global/process
    BUILD_TIME: process.env.BUILD_TIME,
});

function Examples() {
    const demos = [{
        title: '📊 Sheets',
        href: './sheets/',
    }, {
        title: '📝 Docs',
        href: './docs/',
    }, {
        title: '📽️ Slides',
        href: './slides/',
    }, {
        title: '🗂️ Sheets Multi Instance',
        href: './sheets-multi/',
    }, {
        title: '📄 Sheets Uniscript',
        href: './sheets-uniscript/',
    }, {
        title: '📚 Docs Uniscript',
        href: './docs-uniscript/',
    }, {
        title: '🌌 Universe',
        href: './uni/',
    }];

    return (
        <section className={styles.examples}>
            <header className={styles.header}>
                <img className={styles.logo} src="/favicon.svg" alt="Univer" draggable={false} />
                <h1 className={styles.title}>
                    <span>Univer</span>
                    <sup>{pkg.version}</sup>
                </h1>
            </header>

            <section className={styles.list}>
                {demos.map((demo) => (
                    <a key={demo.title} className={styles.btn} href={demo.href}>
                        <span className={styles.text}>{demo.title}</span>
                        <span className={styles.shimmer} />
                    </a>
                ))}
            </section>
        </section>
    );
}

createRoot(document.getElementById('app')!).render(<Examples />);
