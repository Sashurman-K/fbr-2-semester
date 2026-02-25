import React, { useEffect, useState } from "react";
// Проверьте путь (ComicsPage или ComicsPages), должен быть тот, где лежит интерфейс
import { Comic } from "../pages/ComicsPage/ComicsPages";

interface ComicModalProps {
    open: boolean;
    mode: "create" | "edit";
    initialComic: Comic | null;
    onClose: () => void;
    onSubmit: (payload: {
        id?: string | number;
        title: string;
        cost: number;
        quantity: number;
        description: string;
        img: string;
    }) => void;
}

export default function ComicModal({
    open,
    mode,
    initialComic,
    onClose,
    onSubmit
}: ComicModalProps) {
    // Состояния для всех полей
    const [title, setTitle] = useState<string>("");
    const [cost, setCost] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [img, setImg] = useState<string>("");

    useEffect(() => {
        if (!open) return;
        // Предзаполнение полей при редактировании
        setTitle(initialComic?.title ?? "");
        setCost(initialComic?.cost != null ? String(initialComic.cost) : "");
        setQuantity(initialComic?.quantity != null ? String(initialComic.quantity) : "");
        setDescription(initialComic?.description ?? "");
        setImg(initialComic?.img ?? "");
    }, [open, initialComic]);

    if (!open) return null;

    const modalTitle = mode === "edit" ? "Редактирование комикса" : "Добавление комикса";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedTitle = title.trim();
        const parsedCost = Number(cost);
        const parsedQty = Number(quantity);

        // Валидация
        if (!trimmedTitle) {
            alert("Введите название комикса");
            return;
        }
        if (isNaN(parsedCost) || parsedCost < 0) {
            alert("Введите корректную цену");
            return;
        }

        // Передаем полный объект на бэкенд
        onSubmit({
            id: initialComic?.id,
            title: trimmedTitle,
            cost: parsedCost,
            quantity: isNaN(parsedQty) ? 0 : parsedQty,
            description: description.trim(),
            img: img.trim(),
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div
                className="modal"
                onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal__header">
                    <div className="modal__title">{modalTitle}</div>
                    <button className="btn" onClick={onClose} aria-label="Закрыть">✕</button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название
                        <input
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Название комикса"
                            autoFocus
                        />
                    </label>

                    <div className="form__row" style={{ display: 'flex', gap: '10px' }}>
                        <label className="label" style={{ flex: 1 }}>
                            Цена (₽)
                            <input
                                className="input"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                                placeholder="500"
                                inputMode="numeric"
                            />
                        </label>
                        <label className="label" style={{ flex: 1 }}>
                            Кол-во (шт.)
                            <input
                                className="input"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="10"
                                inputMode="numeric"
                            />
                        </label>
                    </div>

                    <label className="label">
                        Ссылка на изображение
                        <input
                            className="input"
                            value={img}
                            onChange={(e) => setImg(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                        />
                    </label>

                    <label className="label">
                        Описание
                        <textarea
                            className="input textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Краткое описание сюжета..."
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}