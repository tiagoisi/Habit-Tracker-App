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
                await onComplete(habit.id);
                setIsCompleted(true);
            }
        } catch (error) {
            console.error('Error al marcar hábito:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ NUEVA LÓGICA: Indicador de Tendencia Mensual
    const monthlyRate = habit.monthlyHabitRate; // 0-100
    let trendColor = '#94a3b8'; // Gris por defecto (o si no aplica)
    let trendIcon = '—';
    let trendTooltip = 'Tasa Mensual: No aplica';

    if (habit.frequency === 'daily' && monthlyRate !== undefined) {
        if (monthlyRate >= 70) {
            trendColor = '#10b981'; // Verde (Alto rendimiento)
            trendIcon = '▲';
            trendTooltip = `Tasa Mensual: ${monthlyRate}% (Excelente)`;
        } else if (monthlyRate >= 50) {
            trendColor = '#f59e0b'; // Amarillo (Rendimiento aceptable)
            trendIcon = '—';
            trendTooltip = `Tasa Mensual: ${monthlyRate}% (Medio)`;
        } else {
            trendColor = '#ef4444'; // Rojo (Bajo rendimiento)
            trendIcon = '▼';
            trendTooltip = `Tasa Mensual: ${monthlyRate}% (Bajo)`;
        }
    }

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
                        {/* Indicador de Racha Actual */}
                        <span className={styles.stat}>
                            🔥 Racha: {habit.currentStreak} días
                        </span>
                        {/* Indicador de Tendencia Mensual */}
                        <span 
                            className={styles.stat} 
                            style={{ 
                                color: trendColor, 
                                borderColor: trendColor, 
                                background: trendColor + '10' // Color con 10% de opacidad
                            }}
                            title={trendTooltip}
                        >
                            {trendIcon} {monthlyRate}% {habit.frequency === 'daily' ? '' : ''}
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