import { Nullable } from '@univer/core';
import { OverGridImagePlugin, OverGridImageProperty } from '../OverGridImagePlugin';

export function RemoveImageProperty(plugin: OverGridImagePlugin, id: string): Nullable<OverGridImageProperty> {
    let options = plugin.getConfig();
    let index = options.value.findIndex((element) => element.id === id);
    if (index === -1) {
        let oldProperty = options.value[index];
        options.value.splice(index, 1);
        return oldProperty;
    }
    return null;
}
