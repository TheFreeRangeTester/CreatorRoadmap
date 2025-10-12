module.exports = {
    useLocation: jest.fn(() => ['/', jest.fn()]),
    useRoute: jest.fn(() => [false, {}]),
    useParams: jest.fn(() => ({})),
    Link: ({ children }) => children,
    Route: ({ children }) => children,
    Router: ({ children }) => children,
    Redirect: () => null,
};

