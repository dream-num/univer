import { ImagePlugin } from '../ImagePlugin';
import { IOverGridImageProperty } from '../Interfaces';

export function AddImageProperty(plugin: ImagePlugin, property: IOverGridImageProperty): string {
    const options = plugin.getConfig();
    if (property.id) {
        property.id = Date.now().toString();
    }
    options.value.push(property);
    plugin.getObserver('onAddImage')!.notifyObservers(property);
    return property.id;
}
