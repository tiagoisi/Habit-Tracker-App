import { useState, useEffect } from 'react';
import styles from './HabitModal.module.css';

const FREQUENCIES = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'custom', label: 'Personalizado' },
];

const ICONS = ['💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '🎯', '✍️', '🎨', '💻', '🧠'];
const COLORS = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

const HabitModal = ({ isOpen, onClose, onSave, habit = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        frequency: 'daily',
        icon: '💪',
        color: '#3b82f6',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (habit) {
            setFormData({
                title: habit.title,
                description: habit.description || '',
                frequency: habit.frequency,
                icon: habit.icon || '💪',
                color: habit.color || '#3b82f6',
            });
        } else {
            setFormData({
                title: '',
                description: '',
                frequency: 'daily',
                icon: '💪',
                color: '#3b82f6',
            });
        }
    }, [habit, isOpen]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error al guardar hábito:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <button onClick={onClose} className={styles.closeBtn}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="title" className={styles.label}>
                            Título *
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Ej: Hacer ejercicio"
                            required
                            minLength={3}
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="description" className={styles.label}>
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={styles.textarea}
                            placeholder="Detalles opcionales..."
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="frequency" className={styles.label}>
                            Frecuencia
                        </label>
                        <select
                            id="frequency"
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            {FREQUENCIES.map((freq) => (
                                <option key={freq.value} value={freq.value}>
                                    {freq.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Icono</label>
                        <div className={styles.iconGrid}>
                            {ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon })}
                                    className={`${styles.iconBtn} ${formData.icon === icon ? styles.selected : ''}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Color</label>
                        <div className={styles.colorGrid}>
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`${styles.colorBtn} ${formData.color === color ? styles.selected : ''}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelBtn}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : habit ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HabitModal;