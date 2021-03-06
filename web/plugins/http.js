import axios from "axios";
import { Modal } from "ant-design-vue";
import Cookie from "js-cookie";

const baseURL = process.server ? process.env.SERVER_SIDE_URL : process.env.AXIOS_BASE_URL;

const instance = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true
});

function showModel (type, title, content) {
    return new Promise((resolve) => {
        setTimeout(() => {
            Modal[type]({
                title,
                content,
                onOk: () => {
                    resolve();
                }
            });
        }, 500);
    });
}

function never () {
    return new Promise(() => { });
}

async function handle (req, { nocheck = false } = {}) {
    let data = {};
    try {
        const res = await req;
        data = res.data;
    } catch (e) {
        if (process.server) {
            throw e;
        } else {
            if (!nocheck) { await showModel("error", "网络错误", e.message); }
            // throw e; // IE上会弹出错误提示
            await never();
        }
    }
    if (!data.success) {
        if (process.server) {
            throw new Error(data.message);
        } else {
            if (!nocheck) { await showModel("info", "错误", data.message); }
            // throw new Error(data.message);
            await never();
        }
    }
    return data;
}

class Http {
    constructor ({ req = null } = {}) {
        this.baseURL = baseURL;
        this.req = req;
    }

    getCookie (key) {
        if (process.server) {
            if (!this.req.headers.cookie) {
                return null;
            }
            const rawCookie = this.req.headers.cookie
                .split(";")
                .find(c => c.trim().startsWith(`${key}=`));
            if (!rawCookie) {
                return null;
            }
            return rawCookie.split("=")[1];
        } else {
            return Cookie.get(key) || null;
        }
    }

    getAuthHeaders () {
        return {
            UserAuth: this.getCookie("UserAuth") || ""
        };
    }

    async get (url, params) {
        params = params || {};
        return await handle(instance.get(url, { params, headers: this.getAuthHeaders() }));
    }

    async get_nocheck (url, params) {
        params = params || {};
        return await handle(instance.get(url, { params, headers: this.getAuthHeaders() }), { nocheck: true });
    }

    async post (url, params, data) {
        params = params || {};
        data = data || {};
        return await handle(instance.post(url, data, { params, headers: this.getAuthHeaders() }));
    }
}

export default ({ req }, inject) => {
    inject("http", new Http({ req }));
};
