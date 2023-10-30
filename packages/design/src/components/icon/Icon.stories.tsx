import type { Meta } from '@storybook/react';

import { Button } from '../button/Button';

const meta: Meta = {
    title: 'Components / Icon',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const PlayGround = {
    render() {
        function handleRedirect() {
            window.open('https://univer-icons.vercel.app/', '_blank');
        }

        return (
            <>
                Check out our icon library at{' '}
                <Button type="link" onClick={handleRedirect}>
                    https://univer-icons.vercel.app/
                </Button>
            </>
        );
    },
};
