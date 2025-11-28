import { useState, useRef, useEffect, useMemo } from 'react';
import styles from './HabitListView.module.css';

const HabitListItem = ({ habit, onComplete, onUncomplete, onEdit, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(habit.completedToday || false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        setIsCompleted(habit.completedToday || false);
    }, [habit.completedToday]);

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    // Calcular comparación
    const comparison = useMemo(() => {
        if (!habit.sparklineData || habit.sparklineData.length < 2) return null;

        const dataLength = habit.sparklineData.length;
        
        if (dataLength >= 28) {
            const current = habit.sparklineData.slice(-14).reduce((sum, val) => sum + val, 0);
            const previous = habit.sparklineData.slice(-28, -14).reduce((sum, val) => sum + val, 0);
            
            if (previous === 0) return current > 0 ? { change: 100, type: 'positive' } : null;
            const percentageChange = Math.round(((current - previous) / previous) * 100);
            return {
                change: percentageChange,
                type: percentageChange > 0 ? 'positive' : percentageChange < 0 ? 'negative' : 'neutral',
            };
        }
        
        if (dataLength >= 14) {
            const current = habit.sparklineData.slice(-7).reduce((sum, val) => sum + val, 0);
            const previous = habit.sparklineData.slice(-14, -7).reduce((sum, val) => sum + val, 0);
            
            if (previous === 0) return current > 0 ? { change: 100, type: 'positive' } : null;
            const percentageChange = Math.round(((current - previous) / previous) * 100);
            return {
                change: percentageChange,
                type: percentageChange > 0 ? 'positive' : percentageChange < 0 ? 'negative' : 'neutral',
            };
        }
        
        const halfPoint = Math.floor(dataLength / 2);
        const current = habit.sparklineData.slice(halfPoint).reduce((sum, val) => sum + val, 0);
        const previous = habit.sparklineData.slice(0, halfPoint).reduce((sum, val) => sum + val, 0);
        
        if (previous === 0) return current > 0 ? { change: 100, type: 'positive' } : null;
        const percentageChange = Math.round(((current - previous) / previous) * 100);
        return {
            change: percentageChange,
            type: percentageChange > 0 ? 'positive' : percentageChange < 0 ? 'negative' : 'neutral',
        };
    }, [habit.sparklineData]);

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

    const monthlyRate = habit.monthlyHabitRate || 0;
    let performanceClass = 'poor';
    let performanceLabel = 'Sin datos';
    
    if (monthlyRate >= 70) {
        performanceClass = 'excellent';
        performanceLabel = `${monthlyRate}%`;
    } else if (monthlyRate >= 50) {
        performanceClass = 'good';
        performanceLabel = `${monthlyRate}%`;
    } else if (monthlyRate > 0) {
        performanceClass = 'poor';
        performanceLabel = `${monthlyRate}%`;
    }

    return (
        <div 
            className={`${styles.listItem} ${isCompleted ? styles.completed : ''}`}
            style={{ '--accent-color': habit.color || '#10b981' }}
        >
            {/* Checkbox */}
            <button
                onClick={handleToggleComplete}
                className={`${styles.listCheckbox} ${isCompleted ? styles.completed : ''}`}
                disabled={loading}
            >
                {loading ? (
                    <span className={styles.spinner}></span>
                ) : (
                    <span className={styles.checkboxIcon}>
                        {isCompleted ? '✓' : habit.icon || '📝'}
                    </span>
                )}
            </button>

            {/* Info */}
            <div className={styles.listInfo}>
                <h3 className={styles.listTitle}>
                    {!isCompleted && <span className={styles.listIcon}>{habit.icon || '📝'}</span>}
                    {habit.title}
                </h3>
                {habit.description && (
                    <p className={styles.listDescription}>{habit.description}</p>
                )}
            </div>

            {/* Stats */}
            <div className={styles.listStats}>
                <div className={styles.listStat}>
                    <span className={styles.listStatIcon}>🔥</span>
                    <span className={styles.listStatValue}>{habit.currentStreak}</span>
                    <span className={styles.listStatLabel}>racha</span>
                </div>
                <div className={styles.listStat}>
                    <span className={styles.listStatIcon}>⭐</span>
                    <span className={styles.listStatValue}>{habit.longestStreak}</span>
                    <span className={styles.listStatLabel}>récord</span>
                </div>
                <div className={styles.listStat}>
                    <span className={styles.listStatIcon}>✅</span>
                    <span className={styles.listStatValue}>{habit.totalCompletions}</span>
                    <span className={styles.listStatLabel}>total</span>
                </div>
            </div>

            {/* Comparison Badge */}
            {comparison && comparison.change !== 0 && (
                <div className={`${styles.listComparison} ${styles[comparison.type]}`}>
                    <span>
                        {comparison.type === 'positive' ? '↗' : 
                         comparison.type === 'negative' ? '↘' : '→'}
                    </span>
                    <span>
                        {comparison.change > 0 ? '+ ' : comparison.change < 0 ? '- ' : ''}
                        {Math.abs(comparison.change)}%
                    </span>
                </div>
            )}

            {/* Performance Badge */}
            {monthlyRate > 0 && (
                <div className={`${styles.listPerformance} ${styles[performanceClass]}`}>
                    {performanceLabel}
                </div>
            )}

            {/* Actions Menu */}
            <div className={styles.listActions} ref={menuRef}>
                <button 
                    className={styles.listMenuButton}
                    onClick={() => setShowMenu(!showMenu)}
                    aria-label="Opciones"
                >
                    ⋯
                </button>
                
                {showMenu && (
                    <div className={styles.menuDropdown}>
                        <button 
                            onClick={() => {
                                onEdit(habit);
                                setShowMenu(false);
                            }}
                            className={styles.menuItem}
                        >
                            <span>✏️</span>
                            Editar
                        </button>
                        <button 
                            onClick={() => {
                                onDelete(habit.id);
                                setShowMenu(false);
                            }}
                            className={`${styles.menuItem} ${styles.menuItemDanger}`}
                        >
                            <span>🗑️</span>
                            Eliminar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabitListItem;