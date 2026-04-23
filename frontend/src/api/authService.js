import { publicAxios, createAuthAxios } from './axiosInstance';

export const signUp = async (username, password) => {
    const response = await publicAxios.post('/public/sign-up', { username, password });
    return response.data;
};

export const verifyLogin = async (username, password) => {
    const authAxios = createAuthAxios(username, password);
    const response = await authAxios.get('/public/login');
    return response.data;
};
