import { useState, useEffect, useRef } from 'react';
import styles from './HabitCard.module.css';

const HabitCard = ({ habit, onComplete, onUncomplete, onEdit, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(habit.completedToday || false);
    const [showMenu, setShowMenu] = useState(false);
    const canvasRef = useRef(null);
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

    // Dibujar gráfico sparkline
    useEffect(() => {
        if (canvasRef.current && habit.sparklineData && habit.sparklineData.length > 0) {
            drawSparkline();
        }
    }, [habit.sparklineData, habit.monthlyHabitRate]);

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

    const drawSparkline = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = habit.sparklineData;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 4;

        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);

        // Determinar color según rendimiento
        const monthlyRate = habit.monthlyHabitRate || 0;
        let lineColor = '#64748b';
        
        if (monthlyRate >= 70) {
            lineColor = '#10b981';
        } else if (monthlyRate >= 50) {
            lineColor = '#f59e0b';
        } else if (monthlyRate > 0) {
            lineColor = '#ef4444';
        }

        // Calcular puntos
        const maxValue = Math.max(...data, 1);
        const stepX = (width - padding * 2) / (data.length - 1);
        const points = data.map((value, index) => ({
            x: padding + index * stepX,
            y: height - padding - ((value / maxValue) * (height - padding * 2))
        }));

        // Dibujar área bajo la línea con gradiente
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding);
        
        for (let i = 0; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.lineTo(points[points.length - 1].x, height - padding);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, lineColor + '50');
        gradient.addColorStop(1, lineColor + '05');
        
        ctx.fillStyle = gradient;
        ctx.fill();

        // Dibujar línea suave con curvas
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            const controlX = (current.x + next.x) / 2;
            ctx.quadraticCurveTo(controlX, current.y, next.x, next.y);
        }

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Dibujar puntos en los extremos
        [points[0], points[points.length - 1]].forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = lineColor;
            ctx.fill();
        });
    };

    const monthlyRate = habit.monthlyHabitRate || 0;
    let performanceColor = '#64748b';
    let performanceLabel = 'Sin datos';
    
    if (monthlyRate >= 70) {
        performanceColor = '#10b981';
        performanceLabel = 'Excelente';
    } else if (monthlyRate >= 50) {
        performanceColor = '#f59e0b';
        performanceLabel = 'Bueno';
    } else if (monthlyRate > 0) {
        performanceColor = '#ef4444';
        performanceLabel = 'Mejorable';
    }

    const hasSparklineData = habit.sparklineData && 
                            Array.isArray(habit.sparklineData) && 
                            habit.sparklineData.length > 0;

    return (
        <div 
            className={`${styles.card} ${isCompleted ? styles.cardCompleted : ''}`}
            style={{ 
                '--accent-color': habit.color || '#10b981',
                '--performance-color': performanceColor
            }}
        >
            {/* Header con icono y menú */}
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <span className={styles.icon}>{habit.icon || '📝'}</span>
                </div>
                
                <div className={styles.menuContainer} ref={menuRef}>
                    <button 
                        className={styles.menuButton}
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
                                <span className={styles.menuIcon}>✏️</span>
                                Editar
                            </button>
                            <button 
                                onClick={() => {
                                    onDelete(habit.id);
                                    setShowMenu(false);
                                }}
                                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                            >
                                <span className={styles.menuIcon}>🗑️</span>
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido principal */}
            <div className={styles.content}>
                <h3 className={styles.title}>{habit.title}</h3>
                {habit.description && (
                    <p className={styles.description}>{habit.description}</p>
                )}
            </div>

            {/* Stats compactas */}
            <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                    <span className={styles.statIcon}>🔥</span>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{habit.currentStreak}</span>
                        <span className={styles.statLabel}>Racha</span>
                    </div>
                </div>
                
                <div className={styles.statItem}>
                    <span className={styles.statIcon}>⭐</span>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{habit.longestStreak}</span>
                        <span className={styles.statLabel}>Récord</span>
                    </div>
                </div>
                
                <div className={styles.statItem}>
                    <span className={styles.statIcon}>✅</span>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{habit.totalCompletions}</span>
                        <span className={styles.statLabel}>Total</span>
                    </div>
                </div>
            </div>

            {/* Sparkline gráfico */}
            {hasSparklineData && (
                <div className={styles.sparklineSection}>
                    <div className={styles.sparklineHeader}>
                        <span className={styles.sparklineTitle}>Últimos 14 días</span>
                        <span className={styles.sparklineBadge}>
                            {performanceLabel} · {monthlyRate}%
                        </span>
                    </div>
                    <div className={styles.sparklineWrapper}>
                        <canvas
                            ref={canvasRef}
                            width={280}
                            height={60}
                            className={styles.sparklineCanvas}
                        />
                    </div>
                </div>
            )}

            {/* Footer con botón de completar */}
            <div className={styles.footer}>
                <button
                    onClick={handleToggleComplete}
                    className={`${styles.completeButton} ${isCompleted ? styles.completed : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                        <span className={styles.spinner}></span>
                    ) : isCompleted ? (
                        <>
                            <span className={styles.checkIcon}>✓</span>
                            <span className={styles.buttonText}>Completado</span>
                        </>
                    ) : (
                        <>
                            <span className={styles.circleIcon}>○</span>
                            <span className={styles.buttonText}>Marcar como completado</span>
                        </>
                    )}
                </button>
            </div>

            {/* Barra de progreso de racha */}
            {habit.currentStreak > 0 && (
                <div className={styles.streakProgress}>
                    <div 
                        className={styles.streakProgressBar}
                        style={{ 
                            width: `${Math.min((habit.currentStreak / habit.longestStreak) * 100, 100)}%` 
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default HabitCard;