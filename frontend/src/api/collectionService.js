export const createCollection = async (authAxios, name, description) => {
    const response = await authAxios.post('/user/collection/create', { name, description });
    return response.data;
};

export const getMyCollections = async (authAxios) => {
    const response = await authAxios.get('/user/collection/my-collections');
    return response.data;
};

export const addPromptToCollection = async (authAxios, collectionId, promptId) => {
    const response = await authAxios.post(`/user/collection/${collectionId}/add/${promptId}`);
    return response.data;
};

export const removePromptFromCollection = async (authAxios, collectionId, promptId) => {
    const response = await authAxios.post(`/user/collection/${collectionId}/remove/${promptId}`);
    return response.data;
};

export const deleteCollection = async (authAxios, collectionId) => {
    const response = await authAxios.delete(`/user/collection/${collectionId}`);
    return response.data;
};

export const toggleCollectionVisibility = async (authAxios, collectionId) => {
    const response = await authAxios.put(`/user/collection/${collectionId}/visibility`);
    return response.data;
};

export const getPublicCollection = async (publicAxios, collectionId) => {
    const response = await publicAxios.get(`/public/collection/${collectionId}`);
    return response.data;
};
