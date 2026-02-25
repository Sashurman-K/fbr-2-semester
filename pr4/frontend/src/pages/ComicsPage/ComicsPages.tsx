import React, { useEffect, useState } from "react";
import "./ComicsPage.scss";
import ComicsList from "../../components/ComicsList";
import ComicModal from "../../components/ComicsModal";
import { api } from "../../api";

// 1. Обновляем интерфейс в соответствии с бэкендом
export interface Comic {
  id: string | number;
  title: string;
  cost: number;
  quantity: number;    // Новое поле
  description: string; // Новое поле
  img: string;         // Новое поле
}

type ModalMode = "create" | "edit";

export default function ComicsPage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingComic, setEditingComic] = useState<Comic | null>(null);

  useEffect(() => {
    loadComics();
  }, []);

  const loadComics = async () => {
    try {
      setLoading(true);
      const data = await api.getComics();
      setComics(data);
    } catch (err) {
      console.error(err);
      alert("Ошибка загрузки комиксов");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (): void => {
    setModalMode("create");
    setEditingComic(null);
    setModalOpen(true);
  };

  const openEdit = (comic: Comic): void => {
    setModalMode("edit");
    setEditingComic(comic);
    setModalOpen(true);
  };

  const closeModal = (): void => {
    setModalOpen(false);
    setEditingComic(null);
  };

  const handleDelete = async (id: string | number): Promise<void> => {
    const ok = window.confirm("Удалить комикс?");
    if (!ok) return;

    try {
      await api.deleteComic(id);
      setComics((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Ошибка удаления");
    }
  };

  // 2. Обновляем тип аргумента payload, чтобы включить все поля
  const handleSubmitModal = async (payload: {
    id?: string | number;
    title: string;
    cost: number;
    quantity: number;
    description: string;
    img: string;
  }): Promise<void> => {
    try {
      if (modalMode === "create") {
        // Убираем id из данных для создания (бэкенд создаст его сам через nanoid)
        const { id, ...createData } = payload;
        const newComic = await api.createComic(createData);
        setComics((prev) => [...prev, newComic]);
      } else if (payload.id) {
        // При редактировании отправляем весь объект целиком
        const updatedComic = await api.updateComic(payload.id, payload);
        setComics((prev) =>
          prev.map((c) => (c.id === payload.id ? updatedComic : c))
        );
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Ошибка сохранения");
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">Comics App</div>
          <div className="header__right">React + TS</div>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Комиксы</h1>
            <button className="btn btn--primary" onClick={openCreate}>
              + Добавить
            </button>
          </div>
          {loading ? (
            <div className="empty">Загрузка...</div>
          ) : (
            <ComicsList
              comics={comics}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>
      <footer className="footer">
        <div className="footer__inner">
          © {new Date().getFullYear()} Comics App
        </div>
      </footer>
      <ComicModal
        open={modalOpen}
        mode={modalMode}
        initialComic={editingComic}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}