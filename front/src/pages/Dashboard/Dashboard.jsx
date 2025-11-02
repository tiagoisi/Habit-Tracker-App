import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { habitService } from '@services/habitService';
import HabitCard from '@components/HabitCard/HabitCard';
import HabitModal from '@components/HabitModal/HabitModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [habits, setHabits] = useState([]);
    const [summary, setSummary] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [habitsData, summaryData] = await Promise.all([
                habitService.getAll(),
                habitService.getTodaySummary(),
            ]);
            setHabits(habitsData);
            setSummary(summaryData);
            
            // Generar datos del mes actual
            generateMonthlyData(habitsData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateMonthlyData = (habitsData) => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = now.getDate();
        const maxHabits = habitsData.length || 5; // Máximo de hábitos posibles
        
        const data = [];
        let previousValue = Math.floor(maxHabits * 0.6); // Empezar en ~60%
        
        for (let day = 1; day <= daysInMonth; day++) {
            if (day <= today) {
                // Crear variación realista con tendencia
                const change = Math.random() * 4 - 2; // Entre -2 y +2
                let completed = Math.round(previousValue + change);
                
                // Mantener dentro del rango válido
                completed = Math.max(0, Math.min(maxHabits, completed));
                
                // Simular días malos ocasionales (15% de probabilidad)
                if (Math.random() < 0.15) {
                    completed = Math.floor(completed * 0.3);
                }
                
                // Simular días perfectos ocasionales (10% de probabilidad)
                if (Math.random() < 0.10) {
                    completed = maxHabits;
                }
                
                // Fines de semana tienden a ser más bajos
                const dayOfWeek = new Date(year, month, day).getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) { // Domingo o Sábado
                    completed = Math.floor(completed * 0.7);
                }
                
                data.push({
                    daysInMonth,
                    day,
                    completed,
                    label: `Día ${day}`
                });
                
                previousValue = completed;
            }
        }
        
        setMonthlyData(data);
    };

    const handleSaveHabit = async (habitData) => {
        try {
            if (editingHabit) {
                await habitService.update(editingHabit.id, habitData);
            } else {
                await habitService.create(habitData);
            }
            await loadData();
            setIsModalOpen(false);
            setEditingHabit(null);
        } catch (error) {
            console.error('Error al guardar hábito:', error);
            throw error;
        }
    };

    const handleComplete = async (habitId) => {
        try {
            const result = await habitService.complete(habitId);
            await loadData();
            return result;
        } catch (error) {
            console.error('Error al completar hábito:', error);
            throw error;
        }
    };

    const handleUncomplete = async (habitId) => {
        try {
            await habitService.uncomplete(habitId);
            await loadData();
        } catch (error) {
            console.error('Error al desmarcar hábito:', error);
            throw error;
        }
    };

    const handleEdit = (habit) => {
        setEditingHabit(habit);
        setIsModalOpen(true);
    };

    const handleDelete = async (habitId) => {
        if (window.confirm('¿Estás seguro de eliminar este hábito?')) {
            try {
                await habitService.delete(habitId);
                await loadData();
            } catch (error) {
                console.error('Error al eliminar hábito:', error);
            }
        }
    };

    const handleNewHabit = () => {
        setEditingHabit(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <Link to="/" className={styles.logoContainer}>
                        <img 
                            src="/logo.png" 
                            alt="Daily Forge" 
                            className={styles.logoImage}
                        />
                    </Link>
                    <div className={styles.navLinks}>
                        <Link to="/" className={styles.navLink}>Inicio</Link>
                        <Link to="/achievements" className={styles.navLink}>Logros</Link>
                        <div className={styles.userMenu}>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user?.name}</span>
                                <span className={styles.userPoints}>
                                    ⭐ {user?.points || 0} pts · Nivel {user?.level || 1}
                                </span>
                            </div>
                            <button onClick={logout} className={styles.logoutBtn}>
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.welcome}>
                    <h2 className={styles.welcomeTitle}>
                        ¡Hola, {user?.name}! 👋
                    </h2>
                    <p className={styles.welcomeText}>
                        {summary && `Completaste ${summary.completedToday} de ${summary.totalHabits} hábitos hoy`}
                    </p>
                </div>

                {summary && (
                    <div className={styles.stats}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🎯</div>
                            <div className={styles.statInfo}>
                                <p className={styles.statValue}>{summary.totalHabits}</p>
                                <p className={styles.statLabel}>Hábitos activos</p>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>✅</div>
                            <div className={styles.statInfo}>
                                <p className={styles.statValue}>{summary.completedToday}</p>
                                <p className={styles.statLabel}>Completados hoy</p>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📊</div>
                            <div className={styles.statInfo}>
                                <p className={styles.statValue}>{summary.completionRate}%</p>
                                <p className={styles.statLabel}>Tasa de completación</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gráfico de progreso mensual */}
                <div className={styles.chartSection}>
                    <h3 className={styles.chartTitle}>Progreso del Mes</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                                <XAxis 
                                    dataKey="daysInMonth" 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <YAxis 
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    label={{ value: 'Hábitos completados', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'rgba(23, 23, 23, 0.95)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        borderRadius: '0.5rem',
                                        color: '#e2e8f0'
                                    }}
                                    labelStyle={{ color: '#10b981' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="completed" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 7, fill: '#34d399' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.habitsSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Mis Hábitos</h3>
                        <button onClick={handleNewHabit} className={styles.addButton}>
                            + Nuevo Hábito
                        </button>
                    </div>

                    {habits.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📝</div>
                            <h4 className={styles.emptyTitle}>
                                No tenés hábitos todavía
                            </h4>
                            <p className={styles.emptyText}>
                                Creá tu primer hábito y comenzá a construir tu mejor versión
                            </p>
                            <button onClick={handleNewHabit} className={styles.emptyButton}>
                                Crear mi primer hábito
                            </button>
                        </div>
                    ) : (
                        <div className={styles.habitsList}>
                            {habits.map((habit) => (
                                <HabitCard
                                    key={habit.id}
                                    habit={habit}
                                    onComplete={handleComplete}
                                    onUncomplete={handleUncomplete}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <HabitModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingHabit(null);
                }}
                onSave={handleSaveHabit}
                habit={editingHabit}
            />
        </div>
    );
};

export default Dashboard;