import api from './api';

export const getSettings = async () => {
    const response = await api.get('/settings');
    return response.data;
};

export const updateSettings = async (settingsData) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
};

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteImage = async (publicId) => {
    const response = await api.delete(`/upload/${publicId}`);
    return response.data;
};