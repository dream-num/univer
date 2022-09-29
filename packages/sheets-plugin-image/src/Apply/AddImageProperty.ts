import { OverGridImagePlugin, OverGridImageProperty } from '../OverGridImagePlugin';

export function AddImageProperty(plugin: OverGridImagePlugin, property: OverGridImageProperty): string {
    let options = plugin.getConfig();
    if (property.id) {
        property.id = Date.now().toString();
    }
    options.value.push(property);
    plugin.getObserver('onAddImage')!.notifyObservers(property);
    return property.id;
}
