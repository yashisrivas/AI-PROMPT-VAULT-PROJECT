export const getProfile = async (axiosInst, username) => {
    const response = await axiosInst.get(`/public/view-creator/${username}`);
    return response.data;
};

export const followUser = async (authAxios, username) => {
    const response = await authAxios.post(`/user/follow/${username}`);
    return response.data;
};

export const unfollowUser = async (authAxios, username) => {
    const response = await authAxios.post(`/user/unfollow/${username}`);
    return response.data;
};

export const commentOnPrompt = async (authAxios, promptId, content) => {
    const response = await authAxios.post(`/user/comment/${promptId}`, { content });
    return response.data;
};

export const userService = {
    getProfile,
    followUser,
    unfollowUser,
    commentOnPrompt
};
