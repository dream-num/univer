import { Observable } from '../Observer/Observable';
import { UIObserver } from '../Types/Interfaces';

export type UniverObserver<T> = {
    onUIChangeObservable: Observable<UIObserver<T>>;
    onUIDidMountObservable: Observable<boolean>;
    onAfterChangeUISkinObservable: Observable<string>;
    onAfterChangeUILocaleObservable: Observable<string>;
    onViewComponentFocusChange: Observable<void>;
};
