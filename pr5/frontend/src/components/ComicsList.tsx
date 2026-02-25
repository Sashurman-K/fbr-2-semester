import React from "react";
import ComicItem from "./ComicItem";
import { Comic } from "../pages/ComicsPage/ComicsPages";

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
                    comic={c} 
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}