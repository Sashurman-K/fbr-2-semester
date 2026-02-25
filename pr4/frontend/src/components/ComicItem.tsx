import React from "react";
import { Comic } from "../pages/ComicsPage/ComicsPages";

interface ComicItemProps {
    comic: Comic;
    onEdit: (comic: Comic) => void;
    onDelete: (id: string | number) => void;
}

export default function ComicItem({ comic, onEdit, onDelete }: ComicItemProps) {
    return (
        <div className="comicCard">
            <div className="comicCard__image">
                {comic.img ? (
                    <img src={comic.img} alt={comic.title} />
                ) : (
                    <div className="no-image">Нет фото</div>
                )}
            </div>

            <div className="comicCard__content">
                <div className="comicCard__header">
                    <span className="comicCard__id">#{comic.id}</span>
                    <h3 className="comicCard__title">{comic.title}</h3>
                </div>

                <p className="comicCard__description">{comic.description}</p>

                <div className="comicCard__info">
                    <span className="comicCard__price">{comic.cost} ₽</span>
                    <span className={`comicCard__qty ${comic.quantity === 0 ? 'empty' : ''}`}>
                        {comic.quantity > 0 ? `В наличии: ${comic.quantity} шт.` : 'Нет в наличии'}
                    </span>
                </div>
            </div>

            <div className="comicCard__actions">
                <button className="btn btn--edit" onClick={() => onEdit(comic)}>
                    Редактировать
                </button>
                <button className="btn btn--danger" onClick={() => onDelete(comic.id)}>
                    Удалить
                </button>
            </div>
        </div>
    );
}