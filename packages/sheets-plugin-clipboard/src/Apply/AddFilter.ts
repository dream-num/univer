import { Nullable } from '@univer/core';
import { Filter, IFilter } from '../Domain';
import { ClipboardPlugin } from '../ClipboardPlugin';

export function AddFilter(plugin: ClipboardPlugin, sheetId: string, filter: Nullable<IFilter>) {
    const filterList = plugin.getFilterList();
    if (filter) {
        filterList.addFilter(sheetId, Filter.fromSequence<Filter>(filter).withContext(plugin.getContext()));
    }
}
