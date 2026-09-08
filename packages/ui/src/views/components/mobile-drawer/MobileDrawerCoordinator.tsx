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

import type { ReactNode } from 'react';
import type { MobileDrawerOpenMode } from './MobileDrawer';
import { createContext, useCallback, useMemo, useRef, useState } from 'react';

interface IMobileDrawerEntry {
    id: symbol;
    onClose: () => void;
}

interface IMobileDrawerCoordinatorContext {
    activeDrawerId: symbol | null;
    close: (id: symbol) => void;
    register: (id: symbol, mode: MobileDrawerOpenMode, onClose: () => void) => void;
    unregister: (id: symbol) => void;
}

export const MobileDrawerCoordinatorContext = createContext<IMobileDrawerCoordinatorContext | null>(null);

export function MobileDrawerCoordinatorProvider(props: { children: ReactNode }) {
    const entriesRef = useRef<IMobileDrawerEntry[]>([]);
    const [activeDrawerId, setActiveDrawerId] = useState<symbol | null>(null);

    const setEntries = useCallback((entries: IMobileDrawerEntry[]) => {
        entriesRef.current = entries;
        setActiveDrawerId(entries.length ? entries[entries.length - 1].id : null);
    }, []);

    const unregister = useCallback((id: symbol) => {
        setEntries(entriesRef.current.filter((entry) => entry.id !== id));
    }, [setEntries]);

    const close = useCallback((id: symbol) => {
        const entry = entriesRef.current.find((item) => item.id === id);
        if (!entry) {
            return;
        }

        unregister(id);
        entry.onClose();
    }, [unregister]);

    const register = useCallback((id: symbol, mode: MobileDrawerOpenMode, onClose: () => void) => {
        const entry = { id, onClose };
        if (mode === 'push') {
            setEntries([...entriesRef.current, entry]);
            return;
        }

        const previousEntries = entriesRef.current;
        setEntries([entry]);
        for (let i = previousEntries.length - 1; i >= 0; i--) {
            previousEntries[i].onClose();
        }
    }, [setEntries]);

    const value = useMemo<IMobileDrawerCoordinatorContext>(() => ({
        activeDrawerId,
        close,
        register,
        unregister,
    }), [activeDrawerId, close, register, unregister]);

    return (
        <MobileDrawerCoordinatorContext.Provider value={value}>
            {props.children}
        </MobileDrawerCoordinatorContext.Provider>
    );
}
