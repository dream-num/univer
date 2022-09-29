import { Nullable } from '@univer/core';
import { ClipboardPlugin } from '../ClipboardPlugin';
import { IFilter } from '../Domain';

export function RemoveFilter(plugin: ClipboardPlugin, sheetId: string): Nullable<IFilter> {
    const filterList = plugin.getFilterList();
    const filterModel = filterList.getGroupModel();
    const filter = filterModel[sheetId];
    delete filterModel[sheetId];
    return filter.toSequence();
}
