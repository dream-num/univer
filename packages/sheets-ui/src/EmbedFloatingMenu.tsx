/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

export type SheetFloatingToolbarItem =
    | { id: string; type: 'button' | 'dropdown' }
    | { id: string; type: 'divider' };

export function createSheetsFloatingToolbarItems(): SheetFloatingToolbarItem[] {
    return [];
}

export function createVisibleSheetsFloatingToolbarItems(): SheetFloatingToolbarItem[] {
    return [];
}

export function createSheetsFloatingMenuContributions(): never[] {
    return [];
}
