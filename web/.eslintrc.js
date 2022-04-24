module.exports = {
    root: false,
    env: {
        browser: true,
        node: true
    },
    parserOptions: {
        parser: "@babel/eslint-parser",
        requireConfigFile: false
    },
    extends: [
        "@nuxtjs",
        "plugin:nuxt/recommended"
    ],
    plugins: [
    ],
    // add your custom rules here
    rules: {
        "vue/multi-word-component-names": 0,
        "vue/no-v-html": 0,
        camelcase: 0,
        indent: [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        quotes: [
            "error",
            "double"
        ],
        semi: [
            "error",
            "always"
        ],
        "space-before-function-paren": ["error", "always"]
    }
};
