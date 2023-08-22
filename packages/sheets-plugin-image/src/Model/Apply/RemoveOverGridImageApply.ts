import { IImagePluginData } from '../../Symbol';
import { IRemoveOverGridImageActionData } from '../Action';

export function RemoveOverGridImageApply(property: IRemoveOverGridImageActionData): void {
    const injector = property.injector;
    if (injector == null) {
        throw new Error('Error injector is null');
    }
    const imagePluginData = injector.get(IImagePluginData);
    imagePluginData.delete(property.id);
}
