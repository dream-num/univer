/**
 * Starting from Univer 0.6.0, with the support for React 19[^1], UMD users may need additional adaptation.
 * It is recommended to migrate to module script[^2] and a more modern build system.
 *
 * [^1]: [Module Script] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#applying_the_module_to_your_html
 * [^2]: [support for React 19] https://github.com/dream-num/univer/pull/4247
 */

/**
 * Fix `Uncaught TypeError: client.createRoot is not a function`
 * If using UMD React < 18, you might need the following code.
 */
(function (global) {
    'use strict';
    if (!global.ReactDOM) {
        throw new Error('ReactDOM must be loaded before ReactCreateRoot.');
    }
    const ReactDOM = global.ReactDOM;
    if (!ReactDOM.createRoot) {
        ReactDOM.createRoot = function (container) {
            return {
                render: (element) => {
                    ReactDOM.render(element, container);
                },
            };
        };
    }
})(this);

/**
 * Fix `Uncaught TypeError: jsxRuntime.jsx is not a function`
 * If using UMD React, you might need the following code.
 * Reference: https://unpkg.com/react@18.3.1/cjs/react-jsx-runtime.production.min.js
 */
(function (global) {
    'use strict';
    if (!global.React) {
        throw new Error('React must be loaded before ReactJSXRuntime.');
    }
    const React = global.React;
    if (!React.jsx || !React.jsxs) {
        const REACT_ELEMENT_TYPE = Symbol.for('react.element');
        const hasOwnProperty = Object.prototype.hasOwnProperty;
        const RESERVED_PROPS = {
            key: true,
            ref: true,
            __self: true,
            __source: true,
        };
        const ReactCurrentOwner = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
        function createReactElement(type, config, maybeKey) {
            const props = {};
            let key = null;
            let ref = null;
            if (maybeKey !== undefined) {
                key = `${maybeKey}`;
            }
            if (config.key !== undefined) {
                key = `${config.key}`;
            }
            if (config.ref !== undefined) {
                ref = config.ref;
            }
            for (var propName in config) {
                if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                    props[propName] = config[propName];
                }
            }
            if (type && type.defaultProps) {
                const defaultProps = type.defaultProps;
                for (var propName in defaultProps) {
                    if (props[propName] === undefined) {
                        props[propName] = defaultProps[propName];
                    }
                }
            }
            return {
                $$typeof: REACT_ELEMENT_TYPE,
                type,
                key,
                ref,
                props,
                _owner: ReactCurrentOwner.current,
            };
        }
        React.jsx = createReactElement;
        React.jsxs = createReactElement;
    }
})(this);
