
const buildModules = [];

if (process.env.NODE_ENV === "production") {
    buildModules.push(
        // https://go.nuxtjs.dev/eslint
        "@nuxtjs/eslint-module"
    );
}

export default {
    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: "五子棋AI对战平台",
        htmlAttrs: {
            lang: "zh"
        },
        meta: [
            { charset: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { hid: "description", name: "description", content: "" },
            { name: "format-detection", content: "telephone=no" }
        ],
        link: [
            { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }
        ]
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [
        "ant-design-vue/dist/antd.css",
        "highlight.js/styles/arta.css",
        "katex/dist/katex.min.css",
        "github-markdown-css/github-markdown.css"
    ],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
        "@/plugins/antd-ui",
        "@/plugins/http"
    ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: true,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules,

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        // https://go.nuxtjs.dev/axios
        "@nuxtjs/axios"
    ],

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
    },

    env: {
        AXIOS_BASE_URL: // 浏览器访问后端的地址
            process.env.NODE_ENV === "production" ? "/api/" : "http://localhost:8000/api/",
        SERVER_SIDE_URL: // SSR服务器访问后端的地址
            "http://localhost:8000/api/"
    }
};
