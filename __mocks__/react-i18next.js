module.exports = {
    useTranslation: () => ({
        t: (key, defaultValue) => defaultValue || key,
        i18n: {
            language: 'en',
            changeLanguage: jest.fn(),
        },
    }),
    Trans: ({ children }) => children,
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    },
    I18nextProvider: ({ children }) => children,
};

