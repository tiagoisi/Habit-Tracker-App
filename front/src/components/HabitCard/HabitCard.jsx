import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import styles from './HabitCard.module.css';

const HabitCard = ({ habit, onComplete, onUncomplete, onEdit, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(habit.completedToday || false);

    // Actualizar estado cuando cambia el hábito
    useEffect(() => {
        setIsCompleted(habit.completedToday || false);
    }, [habit.completedToday]);

    // ✅ Función para lanzar confetti
    const launchConfetti = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            zIndex: 9999,
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
            });
        }

        // Explosión con múltiples ángulos y colores
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
            colors: ['#10b981', '#34d399', '#6ee7b7'],
        });
        fire(0.2, {
            spread: 60,
            colors: ['#10b981', '#059669', '#047857'],
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
            colors: ['#34d399', '#6ee7b7', '#a7f3d0'],
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
            colors: ['#10b981', '#10b981'],
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
            colors: ['#34d399', '#6ee7b7'],
        });
    };

    const handleToggleComplete = async () => {
        setLoading(true);
        try {
            if (isCompleted) {
                await onUncomplete(habit.id);
                setIsCompleted(false);
            } else {
                const result = await onComplete(habit.id);
                setIsCompleted(true);
                
                // ✅ Lanzar confetti al completar
                launchConfetti();
                
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