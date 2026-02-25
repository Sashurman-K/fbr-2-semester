import axios, { AxiosResponse } from "axios";
// Импортируем обновленный интерфейс (рекомендую переименовать его в Comic)
import { Comic } from "../pages/ComicsPage/ComicsPages";

// 1. Описываем тип для данных при создании (без ID)
export type CreateComicPayload = Omit<Comic, 'id'>;

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    }
});

export const api = {
    // Получить все комиксы
    getComics: async (): Promise<Comic[]> => {
        const response: AxiosResponse<Comic[]> = await apiClient.get("/comics");
        return response.data;
    },

    // Получить один комикс
    getComicById: async (id: string | number): Promise<Comic> => {
        const response: AxiosResponse<Comic> = await apiClient.get(`/comics/${id}`);
        return response.data;
    },

    // Создать комикс
    createComic: async (data: CreateComicPayload): Promise<Comic> => {
        const response: AxiosResponse<Comic> = await apiClient.post("/comics", data);
        return response.data;
    },

    // Обновить комикс
    updateComic: async (id: string | number, data: Partial<Comic>): Promise<Comic> => {
        const response: AxiosResponse<Comic> = await apiClient.patch(`/comics/${id}`, data);
        return response.data;
    },

    // Удалить комикс
    deleteComic: async (id: string | number): Promise<void> => {
        await apiClient.delete(`/comics/${id}`);
    }
};