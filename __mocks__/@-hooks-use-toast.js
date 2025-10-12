module.exports = {
    useToast: jest.fn(() => ({
        toast: jest.fn(),
        dismiss: jest.fn(),
        toasts: [],
    })),
    toast: jest.fn(),
};

