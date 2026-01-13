const React = require('react');

const motion = new Proxy({}, {
    get: (target, prop) => {
        const tagName = typeof prop === 'string' ? prop : 'div';
        return React.forwardRef(({ children, ...props }, ref) => {
            return React.createElement(tagName, { ref, ...props }, children);
        });
    },
});

module.exports = {
    motion,
    AnimatePresence: ({ children }) => children,
    useAnimation: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        set: jest.fn(),
    })),
    useInView: jest.fn(() => false),
    useMotionValue: jest.fn(() => ({ set: jest.fn(), get: jest.fn(() => 0) })),
    useTransform: jest.fn(() => ({ set: jest.fn(), get: jest.fn(() => 0) })),
    useSpring: jest.fn(() => ({ set: jest.fn(), get: jest.fn(() => 0) })),
};

