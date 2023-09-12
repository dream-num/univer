import { render } from '@testing-library/react';

import { Avatar } from '..';

describe('Avatar', () => {
    test('should display initial Avatar', () => {
        const { container } = render(<Avatar size="small">哈哈</Avatar>);
        expect(container);
    });
    test('should display initial Avatar', () => {
        let a = 1;
        const { container } = render(
            <Avatar src="https//www.baidu.com/img/PC_880906d2a4ad95f5fafb2e540c5cdad7.png" title="a" alt="a" fit="fill" onLoad={() => a++} onError={() => a++}></Avatar>
        );
        expect(container);
    });
});
