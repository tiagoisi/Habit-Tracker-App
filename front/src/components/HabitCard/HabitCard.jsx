import { useState, useEffect } from 'react';
import styles from './HabitCard.module.css';

const HabitCard = ({ habit, onComplete, onUncomplete, onEdit, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(habit.completedToday || false);

    // Actualizar estado cuando cambia el hábito
    useEffect(() => {
        setIsCompleted(habit.completedToday || false);
    }, [habit.completedToday]);

    const handleToggleComplete = async () => {
        setLoading(true);
        try {
            if (isCompleted) {
                await onUncomplete(habit.id);
                setIsCompleted(false);
            } else {
                const result = await onComplete(habit.id);
                setIsCompleted(true);
                
                // Mostrar logros desbloqueados si los hay
                if (result.newAchievements && result.newAchievements.length > 0) {
                    // TODO: Mostrar modal de logros desbloqueados
                    console.log('¡Nuevos logros!', result.newAchievements);
                }
            }
        } catch (error) {
            console.error('Error al marcar hábito:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.card} style={{ borderLeft: `4px solid ${habit.color || '#3b82f6'}` }}>
            <div className={styles.content}>
                <div className={styles.iconSection}>
                    <span className={styles.icon}>{habit.icon || '📝'}</span>
                </div>

                <div className={styles.info}>
                    <h3 className={styles.title}>{habit.title}</h3>
                    {habit.description && (
                        <p className={styles.description}>{habit.description}</p>
                    )}
                    
                    <div className={styles.stats}>
                        <span className={styles.stat}>
                            🔥 {habit.currentStreak} días
                        </span>
                        <span className={styles.stat}>
                            🏆 Mejor: {habit.longestStreak}
                        </span>
                        <span className={styles.stat}>
                            ✅ Total: {habit.totalCompletions}
                        </span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        onClick={handleToggleComplete}
                        className={`${styles.completeBtn} ${isCompleted ? styles.completed : ''}`}
                        disabled={loading}
                    >
                        {isCompleted ? '✓' : '○'}
                    </button>
                </div>
            </div>

            <div className={styles.footer}>
                <button onClick={() => onEdit(habit)} className={styles.footerBtn}>
                    ✏️ Editar
                </button>
                <button onClick={() => onDelete(habit.id)} className={styles.footerBtn}>
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    );
};

export default HabitCard;