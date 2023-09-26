import { CanvasView } from '@univerjs/base-slides';
import { ICurrentUniverService, ISlidePage } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SlideBar } from '../View/SlideBar/SlideBar';

export class SlideBarUIController {
    private _slideBar: SlideBar;

    private _pages: ISlidePage[] = [];

    constructor(
        @Inject(CanvasView) private readonly _canvasView: CanvasView,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
        this._initialize();
    }

    // 获取SlideBar组件
    getComponent = (ref: SlideBar) => {
        this._slideBar = ref;
        this.setSlideBar();
    };

    setSlideBar() {
        const canvasView = this._getCanvasView();
        this._slideBar.setSlide(this._pages, () => {
            const slideBarRef = this._slideBar.slideBarRef;
            const thumbList = slideBarRef.current?.childNodes[0].childNodes;
            canvasView.createSlidePages(thumbList, this._pages);
        });

        canvasView.getSlide().onSlideChangePageByNavigationObservable.add((pageId) => {
            if (this._slideBar.state.activePageId === pageId || pageId == null) {
                return;
            }
            this._slideBar.setState({
                activePageId: pageId,
            });
            canvasView.activePage(pageId);
        });
    }

    /**
     * Arrow functions must be used to bind `this`, otherwise `this` will be lost when the DOM component triggers the callback
     */
    addSlide = () => {
        const model = this._currentUniverService.getCurrentUniverSlideInstance().getSlideModel();
        const canvasView = this._getCanvasView();
        const newPage = model.addPage();
        this._pages.push(newPage);

        this._slideBar.setSlide(this._pages, () => {
            const slideBarRef = this._slideBar.slideBarRef;
            const thumbList = slideBarRef.current?.childNodes[0].childNodes;
            canvasView.createSlidePages(thumbList, this._pages);
        });
    };

    activeSlide = (pageId: string) => {
        const canvasView = this._getCanvasView();
        canvasView.activePage(pageId);
    };

    private _initialize() {
        this._generateModel();
    }

    private _getCanvasView() {
        return this._canvasView;
    }

    private _generateModel() {
        const model = this._currentUniverService.getCurrentUniverSlideInstance().getSlideModel();
        const pages = model.getPages();
        const pageOrder = model.getPageOrder();
        if (!pages || !pageOrder) {
            return;
        }

        pageOrder.forEach((pageKey: string) => {
            this._pages.push(pages[pageKey]);
        });
    }
}
