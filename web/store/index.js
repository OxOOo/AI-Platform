export const state = () => ({
    my_info: null
});

export const mutations = {
    setMyInfo (state, my_info) {
        state.my_info = my_info;
    }
};

export const getters = {
    myInfo (state) {
        return state.my_info;
    }
};

export const actions = {
    async nuxtServerInit ({ commit }) {
        const res = await this.$http.get("/user/my_info");
        commit("setMyInfo", res.data);
    }
};
