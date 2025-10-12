const React = require('react');

module.exports = {
    QueryClient: jest.fn().mockImplementation(() => ({
        setQueryData: jest.fn(),
        invalidateQueries: jest.fn(),
        getQueryData: jest.fn(),
        clear: jest.fn(),
    })),
    QueryClientProvider: ({ children }) => children,
    useQuery: jest.fn(() => ({
        data: null,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
    })),
    useMutation: jest.fn(() => ({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
        isLoading: false,
        isError: false,
        error: null,
    })),
    useQueryClient: jest.fn(() => ({
        setQueryData: jest.fn(),
        invalidateQueries: jest.fn(),
        getQueryData: jest.fn(),
    })),
    useInfiniteQuery: jest.fn(() => ({
        data: null,
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
    })),
};

