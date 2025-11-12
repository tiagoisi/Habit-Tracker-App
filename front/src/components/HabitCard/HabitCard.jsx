import { useState, useEffect, useRef } from 'react';
import styles from './HabitCard.module.css';

const HabitCard = ({ habit, onComplete, onUncomplete, onEdit, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(habit.completedToday || false);
    const canvasRef = useRef(null);

    useEffect(() => {
        setIsCompleted(habit.completedToday || false);
    }, [habit.completedToday]);

    // ✅ Dibujar gráfico estilo Apple
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

    // ✅ Función para dibujar el mini gráfico
    const drawSparkline = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = habit.sparklineData;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 2;

        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);

        // Determinar color según rendimiento
        const monthlyRate = habit.monthlyHabitRate || 0;
        let lineColor = '#64748b';
        
        if (monthlyRate >= 70) {
            lineColor = '#10b981'; // Verde
        } else if (monthlyRate >= 50) {
            lineColor = '#f59e0b'; // Amarillo
        } else if (monthlyRate > 0) {
            lineColor = '#ef4444'; // Rojo
        }

        // Calcular puntos
        const stepX = (width - padding * 2) / (data.length - 1);
        const points = data.map((value, index) => ({
            x: padding + index * stepX,
            y: height - padding - (value * (height - padding * 2))
        }));

        // Dibujar línea suave con curvas Bezier
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            
            // Punto de control para curva suave
            const controlX = (current.x + next.x) / 2;
            
            ctx.quadraticCurveTo(controlX, current.y, next.x, next.y);
        }

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Dibujar área bajo la línea (opcional, estilo iOS)
        ctx.lineTo(points[points.length - 1].x, height);
        ctx.lineTo(points[0].x, height);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, lineColor + '40'); // 25% opacidad
        gradient.addColorStop(1, lineColor + '00'); // 0% opacidad
        
        ctx.fillStyle = gradient;
        ctx.fill();
    };

    const monthlyRate = habit.monthlyHabitRate || 0;
    let performanceColor = '#64748b';
    
    if (monthlyRate >= 70) {
        performanceColor = '#10b981';
    } else if (monthlyRate >= 50) {
        performanceColor = '#f59e0b';
    } else if (monthlyRate > 0) {
        performanceColor = '#ef4444';
    }

    const hasSparklineData = habit.sparklineData && 
                            Array.isArray(habit.sparklineData) && 
                            habit.sparklineData.length > 0;

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

                    {/* ✅ Mini gráfico estilo Apple Stocks */}
                    {hasSparklineData && (
                        <div className={styles.sparklineContainer}>
                            <div className={styles.sparklineWrapper}>
                                <canvas
                                    ref={canvasRef}
                                    width={140}
                                    height={32}
                                    className={styles.sparklineCanvas}
                                />
                            </div>
                            <span 
                                className={styles.sparklineLabel}
                                style={{ color: performanceColor }}
                            >
                                Últimos 14 días · {monthlyRate}%
                            </span>
                        </div>
                    )}
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