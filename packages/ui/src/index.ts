/**
 * Copyright 2023-present DreamNum Inc.
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

export * from './common';
export { getMenuHiddenObservable } from './common/menu-hidden-observable';
export * from './components';
export { t } from './components/hooks/locale';
export { useObservable } from './components/hooks/observable';
export { useEvent } from './components/hooks/event';
export {
    CopyShortcutItem,
    CutShortcutItem,
    RedoShortcutItem,
    SharedController,
    UndoShortcutItem,
} from './controllers/shared-shortcut.controller';
export { DesktopUIController } from './controllers/ui/ui-desktop.controller';
export { IUIPartsService, BuiltInUIPart, UIPartsService } from './services/parts/parts.service';
export { DesktopBeforeCloseService, IBeforeCloseService } from './services/before-close/before-close.service';
export { CopyCommand, CutCommand, PasteCommand } from './services/clipboard/clipboard.command';
export {
    BrowserClipboardService,
    HTML_CLIPBOARD_MIME_TYPE,
    IClipboardInterfaceService,
    PLAIN_TEXT_CLIPBOARD_MIME_TYPE,
} from './services/clipboard/clipboard-interface.service';
export { IConfirmService } from './services/confirm/confirm.service';
export { DesktopConfirmService } from './services/confirm/desktop-confirm.service';
export {
    DesktopContextMenuService,
    type IContextMenuHandler,
    IContextMenuService,
} from './services/contextmenu/contextmenu.service';
export { DesktopDialogService } from './services/dialog/desktop-dialog.service';
export { type IDialogPartMethodOptions } from './views/components/dialog-part/interface';
export { IDialogService } from './services/dialog/dialog.service';
export { ILayoutService, DesktopLayoutService } from './services/layout/layout.service';
export {
    type ICustomComponentProps,
    type IDisplayMenuItem,
    type IMenuButtonItem,
    type IMenuItem,
    type IMenuItemFactory,
    type IMenuSelectorItem,
    type IValueOption,
    type MenuConfig,
    MenuGroup,
    MenuItemType,
    MenuPosition,
    type MenuItemDefaultValueType,
} from './services/menu/menu';
export { DesktopMenuService, IMenuService } from './services/menu/menu.service';
export { DesktopMessageService } from './services/message/desktop-message.service';
export { IMessageService } from './services/message/message.service';
export { DesktopNotificationService } from './services/notification/desktop-notification.service';
export { type NotificationType, type INotificationOptions } from './components/notification/Notification';
export { INotificationService } from './services/notification/notification.service';
export { DesktopPlatformService, IPlatformService } from './services/platform/platform.service';
export { DesktopGlobalZoneService } from './services/global-zone/desktop-global-zone.service';
export { IGlobalZoneService } from './services/global-zone/global-zone.service';
export { KeyCode, MetaKeys } from './services/shortcut/keycode';
export { DesktopShortcutService, type IShortcutItem, IShortcutService } from './services/shortcut/shortcut.service';
export { DesktopSidebarService } from './services/sidebar/desktop-sidebar.service';
export { ISidebarService } from './services/sidebar/sidebar.service';
export { IZenZoneService } from './services/zen-zone/zen-zone.service';
export { UNIVER_UI_PLUGIN_NAME, UniverUIPlugin, DISABLE_AUTO_FOCUS_KEY } from './ui-plugin';
export * from './utils';
export { type IConfirmPartMethodOptions } from './views/components/confirm-part/interface';
export { ComponentContainer, useComponentsOfPart, type IComponentContainerProps } from './views/components/ComponentContainer';
export { IEditorService, EditorService } from './services/editor/editor.service';
export { TextEditor } from './components/editor/TextEditor';
export { SetEditorResizeOperation } from './commands/operations/editor/set-editor-resize.operation';
export { RangeSelector } from './components/range-selector/RangeSelector';
export { ProgressBar } from './components/progress-bar/ProgressBar';
export { type IMenuGroup, useToolbarGroups, useToolbarItemStatus, useToolbarCollapseObserver } from './views/components/doc-bars/hook';
export { Toolbar } from './views/components/doc-bars/Toolbar';
export { FloatDom } from './views/components/dom/FloatDom';
export { mergeMenuConfigs } from './common/menu-merge-configs';

// #region - workbench components

export { GlobalZone } from './views/components/global-zone/GlobalZone';
export { builtInGlobalComponents } from './views/parts';
export { ContextMenu } from './views/components/context-menu/ContextMenu';
export { Sidebar } from './views/components/sidebar/Sidebar';
export { ZenZone } from './views/components/zen-zone/ZenZone';
export { CanvasPopup } from './views/components/popup/CanvasPopup';
export { CanvasFloatDomService, type IFloatDomLayout } from './services/dom/canvas-dom-layer.service';

// #endregion

// #region - controllers

export { ErrorController } from './controllers/error/error.controller';
export { ShortcutPanelController } from './controllers/shortcut-display/shortcut-panel.controller';
export { IUIController, type IUniverUIConfig, type IWorkbenchOptions } from './controllers/ui/ui.controller';

// #endregion

// #region - services

export { RangeSelectorService, IRangeSelectorService } from './services/range-selector/range-selector.service';
export { ShortcutPanelService } from './services/shortcut/shortcut-panel.service';
export { DesktopLocalStorageService } from './services/local-storage/local-storage.service';
export { CanvasPopupService, ICanvasPopupService, type IPopup } from './services/popup/canvas-popup.service';
export { IProgressService, ProgressService } from './services/progress/progress.service';
export type { IProgressStep } from './services/progress/progress.service';
export { DesktopZenZoneService } from './services/zen-zone/desktop-zen-zone.service';
