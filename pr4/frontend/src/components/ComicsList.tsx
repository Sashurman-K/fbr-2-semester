import React from "react";
import ComicItem from "./ComicItem"; // Убедитесь, что название файла ComicItem.tsx (без s)
import { Comic } from "../pages/ComicsPage/ComicsPages"; // Исправил путь к интерфейсу

interface ComicsListProps {
    comics: Comic[];
    onEdit: (comic: Comic) => void;
    onDelete: (id: string | number) => void;
}

export default function ComicsList({ comics, onEdit, onDelete }: ComicsListProps) {
    if (!comics.length) {
        return <div className="empty">Комиксов пока нет</div>;
    }

    return (
        <div className="list">
            {comics.map((c) => (
                <ComicItem
                    key={c.id}
                    comic={c} // Передаем объект целиком со всеми новыми полями (img, description и т.д.)
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}