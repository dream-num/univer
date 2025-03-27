/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

export const FloatButton = () => {
    const divStyle = {
        width: '100px',
        height: '30px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center' as const,
    };
    const clickHandler = () => {
        console.warn('click');
    };
    return (
        <div style={divStyle} onClick={clickHandler}>
            FloatButton
        </div>
    );
};

export const AIButton = () => {
    const divStyle = {
        width: '80px',
        height: '50px',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center' as const,
        borderRadius: '25px',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',

        background: 'linear-gradient(90deg, #00C9FF 0%, #92FE9D 50%, #00C9FF 100%)',
        backgroundSize: '200% auto',
        animation: 'gradient 3s linear infinite',

        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 20px rgba(0, 201, 255, 0.3)',
        },
    };
    const clickHandler = () => {
        console.warn('click');
    };
    return (
        <button type="button" style={divStyle} onClick={clickHandler}>
            AI
            <style>
                {`
                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }

                    button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px rgba(0, 201, 255, 0.3);
                    }
                `}
            </style>
        </button>
    );
};
