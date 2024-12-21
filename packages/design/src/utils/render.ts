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

/**
 * Inspired by https://github.com/react-component/util
 */

import type * as React from 'react';
import type { Root } from 'react-dom/client';
import * as ReactDOM from 'react-dom';

type CreateRoot = (container: ContainerType) => Root;

type fullClone = typeof ReactDOM & {
    __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
        usingClientEntryPoint?: boolean;
    };
    createRoot?: CreateRoot;
};

let fullClone: fullClone;
async function getFullClone() {
    if (fullClone) return fullClone;

    try {
        const { default: client } = await import('react-dom/client');
        fullClone = { ...ReactDOM, ...client };
    } catch {
        fullClone = { ...ReactDOM };
    }

    return fullClone;
}

async function getCreateRoot() {
    const fullClone = await getFullClone();

    let createRoot: CreateRoot | undefined;
    try {
        const mainVersion = Number((fullClone.version || '').split('.')[0]);
        if (mainVersion >= 18) {
            createRoot = fullClone.createRoot;
        }
    } catch {}

    return createRoot;
}

async function toggleWarning(skip: boolean) {
    const { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } = await getFullClone();

    if (
        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED &&
    typeof __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED === 'object'
    ) {
        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.usingClientEntryPoint =
      skip;
    }
}

const MARK = '__rc_react_root__';

// ========================== Render ==========================
type ContainerType = (Element | DocumentFragment) & {
    [MARK]?: Root;
};

async function modernRender(node: React.ReactElement, container: ContainerType) {
    toggleWarning(true);
    const createRoot = await getCreateRoot();
    const root = container[MARK] || createRoot?.(container);
    toggleWarning(false);

    root?.render(node);

    container[MARK] = root;
}

async function legacyRender(node: React.ReactElement, container: ContainerType) {
    const { render: reactRender } = await getFullClone();
    reactRender(node, container);
}

export async function render(node: React.ReactElement, container: ContainerType) {
    const createRoot = await getCreateRoot();
    if (createRoot) {
        modernRender(node, container);
        return;
    }

    legacyRender(node, container);
}

// ========================= Unmount ==========================
async function modernUnmount(container: ContainerType) {
  // Delay to unmount to avoid React 18 sync warning
    return Promise.resolve().then(() => {
        container[MARK]?.unmount();

        delete container[MARK];
    });
}

async function legacyUnmount(container: ContainerType) {
    const { unmountComponentAtNode } = await getFullClone();
    unmountComponentAtNode(container);
}

export async function unmount(container: ContainerType) {
    const createRoot = await getCreateRoot();
    if (createRoot !== undefined) {
    // Delay to unmount to avoid React 18 sync warning
        return modernUnmount(container);
    }

    legacyUnmount(container);
}
