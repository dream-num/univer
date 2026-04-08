/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import { clsx, render } from '@univerjs/design';
import { defaultTheme } from '@univerjs/themes';
import { ThemeSwitcherService } from '@univerjs/ui';
import { useState } from 'react';
import pkg from '../../package.json';
import { demos } from './demos';

import './global.css';

type DemoCategoryKey = 'sheets' | 'docs' | 'slides' | 'others';

const CATEGORY_ORDER: DemoCategoryKey[] = ['sheets', 'docs', 'slides', 'others'];
const PRIMARY_CATEGORY_ORDER: DemoCategoryKey[] = ['sheets', 'docs', 'slides'];

const CATEGORY_TITLES: Record<DemoCategoryKey, string> = {
    sheets: 'Sheets',
    docs: 'Docs',
    slides: 'Slides',
    others: 'Others',
};

function getDemoCategory(dir: string): DemoCategoryKey {
    if (dir.startsWith('sheets') || dir.includes('sheets')) {
        return 'sheets';
    }

    if (dir.startsWith('docs') || dir.includes('docs')) {
        return 'docs';
    }

    if (dir.startsWith('slides') || dir.includes('slides')) {
        return 'slides';
    }

    return 'others';
}

const groupedDemos = CATEGORY_ORDER.map((category) => ({
    category,
    title: CATEGORY_TITLES[category],
    items: demos.filter((demo) => getDemoCategory(demo.dir) === category),
})).filter((group) => group.items.length > 0);

const primaryGroups = PRIMARY_CATEGORY_ORDER.map((category) => groupedDemos.find((group) => group.category === category)).filter(
    (group): group is (typeof groupedDemos)[number] => Boolean(group)
);

const defaultCategory = primaryGroups[0]?.category ?? groupedDemos[0]?.category ?? 'sheets';

// package info
// eslint-disable-next-line node/prefer-global/process
if (process.env.NODE_ENV === 'production') {
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
}

function DemoList({ items }: { items: (typeof demos)[number][] }) {
    return (
        <ul>
            {items.map((demo) => (
                <li
                    key={demo.dir}
                >
                    <a
                        className="
                          univer-flex univer-items-center univer-rounded-lg univer-px-4 univer-py-3 univer-no-underline
                          hover:univer-bg-slate-50
                        "
                        href={demo.href}
                    >
                        <span
                            className="
                              univer-min-w-0 univer-shrink univer-truncate univer-font-medium univer-text-slate-900
                            "
                        >
                            {demo.title}
                        </span>
                        <span
                            aria-hidden="true"
                            className="
                              univer-mx-3 univer-min-w-4 univer-flex-1 univer-border-b univer-border-dotted
                              univer-border-slate-300
                            "
                        />
                        <span className="univer-shrink-0 univer-text-sm univer-text-slate-500">{demo.dir}</span>
                    </a>
                </li>
            ))}
        </ul>
    );
}

function Examples() {
    new ThemeSwitcherService().injectThemeToHead(defaultTheme);

    const [activeCategory, setActiveCategory] = useState<DemoCategoryKey>(defaultCategory);
    const activeGroup = primaryGroups.find((group) => group.category === activeCategory) ?? primaryGroups[0];
    const otherGroup = groupedDemos.find((group) => group.category === 'others');

    return (
        <main
            className="
              univer-h-screen univer-overflow-y-auto univer-bg-white univer-px-6 univer-py-10 univer-text-slate-800
            "
        >
            <section className="univer-mx-auto univer-max-w-3xl">
                <header className="univer-mb-8 univer-flex univer-items-center univer-gap-4">
                    <img className="univer-w-12" src="/favicon.svg" alt="Univer" draggable={false} />
                    <div>
                        <h1 className="univer-text-3xl univer-font-semibold univer-text-slate-900">
                            Univer
                            <sup className="univer-ml-2 univer-text-sm univer-font-normal univer-text-slate-500">
                                v
                                {pkg.version}
                            </sup>
                        </h1>
                    </div>
                </header>

                <section className="univer-mb-8">
                    <div className="univer-mb-4 univer-flex univer-gap-2">
                        {primaryGroups.map((group) => {
                            const isActive = group.category === activeCategory;

                            return (
                                <button
                                    key={group.category}
                                    className={clsx(`
                                      univer-cursor-pointer univer-rounded-full univer-border-none univer-px-4
                                      univer-py-2 univer-text-sm univer-font-medium
                                    `, isActive
                                        ? 'univer-bg-slate-900 univer-text-white'
                                        : `
                                          univer-bg-white univer-font-medium univer-text-slate-700
                                          hover:univer-bg-slate-50
                                        `)}
                                    type="button"
                                    onClick={() => setActiveCategory(group.category)}
                                >
                                    {group.title}
                                    (
                                    {group.items.length}
                                    )
                                </button>
                            );
                        })}
                    </div>

                    {activeGroup && (
                        <section>
                            <h2 className="univer-mb-3 univer-text-lg univer-font-semibold univer-text-slate-900">
                                {activeGroup.title}
                            </h2>
                            <DemoList items={activeGroup.items} />
                        </section>
                    )}
                </section>

                {otherGroup && (
                    <section>
                        <h2 className="univer-mb-3 univer-text-lg univer-font-semibold univer-text-slate-900">
                            {otherGroup.title}
                        </h2>
                        <DemoList items={otherGroup.items} />
                    </section>
                )}
            </section>
        </main>
    );
}

render(<Examples />, document.getElementById('app')!);
