export const getPrompts = async (authAxios) => {
    const response = await authAxios.get('/prompt/view-prompts');
    return response.data;
};

export const createPrompt = async (authAxios, data) => {
    const response = await authAxios.post('/prompt/create', data);
    return response.data;
};

export const editPrompt = async (authAxios, id, data) => {
    const response = await authAxios.put(`/prompt/edit/${id}`, data);
    return response.data;
};

export const deletePrompt = async (authAxios, id) => {
    const response = await authAxios.delete(`/prompt/delete/${id}`);
    return response.data;
};

export const getAllPublicPrompts = async (authAxios, page = 0, size = 10) => {
    const response = await authAxios.get(`/public/all-prompts?page=${page}&size=${size}`);
    return response.data;
};

export const getTrendingPrompts = async (authAxios) => {
    const response = await authAxios.get(`/public/trending`);
    return response.data;
};

export const forkPrompt = async (authAxios, id) => {
    const response = await authAxios.post(`/prompt/fork/${id}`);
    return response.data;
};
export const incrementPromptView = async (axiosInst, id) => {
    // This is often fire-and-forget, so we don't necessarily need to return the data
    await axiosInst.post(`/public/view-count/${id}`);
};

export const getSavedPrompts = async (authAxios) => {
    const response = await authAxios.get('/user/saved-prompts');
    return response.data;
};

export const getRecommendedPrompts = async (authAxios) => {
    const response = await authAxios.get('/user/recommended-prompts');
    return response.data;
};
