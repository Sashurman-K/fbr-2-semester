import axios, { AxiosResponse } from "axios";

import { Comic } from "../pages/ComicsPage/ComicsPages";


export type CreateComicPayload = Omit<Comic, 'id'>;

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    }
});

export const api = {

    getComics: async (): Promise<Comic[]> => {
        const response: AxiosResponse<Comic[]> = await apiClient.get("/comics");
        return response.data;
    },


    getComicById: async (id: string | number): Promise<Comic> => {
        const response: AxiosResponse<Comic> = await apiClient.get(`/comics/${id}`);
        return response.data;
    },


    createComic: async (data: CreateComicPayload): Promise<Comic> => {
        const response: AxiosResponse<Comic> = await apiClient.post("/comics", data);
        return response.data;
    },


    updateComic: async (id: string | number, data: Partial<Comic>): Promise<Comic> => {
        const response: AxiosResponse<Comic> = await apiClient.patch(`/comics/${id}`, data);
        return response.data;
    },


    deleteComic: async (id: string | number): Promise<void> => {
        await apiClient.delete(`/comics/${id}`);
    }
};