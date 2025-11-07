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
            const [habitsData, summaryData, monthlyStats] = await Promise.all([
                habitService.getAll(),
                habitService.getTodaySummary(),
                habitService.getMonthlyStats(), // ✅ Obtener datos reales
            ]);
            setHabits(habitsData);
            setSummary(summaryData);
            setMonthlyData(monthlyStats.data || []); // ✅ Usar datos del backend
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
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
                            {/* ✅ CAMBIO: Usar monthlyCompletionRate en vez de completionRate */}
                            <p className={styles.statValue}>{summary.monthlyCompletionRate}%</p>
                            <p className={styles.statLabel}>Tasa de completación</p>
                             {/* ✅ Info adicional */}
                            <p className={styles.statSubtext}>
                                {summary.monthlyCompletions} de {summary.possibleCompletions} este mes
                            </p>
                        </div>
                    </div>
                </div>
                 )}

                {/* Gráfico de progreso mensual */}
                <div className={styles.chartSection}>
                    <h3 className={styles.chartTitle}>Progreso del Mes</h3>
                    <div className={styles.chartContainer}>
                        {monthlyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                                    
                                    <XAxis 
                                        dataKey="day"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        stroke="#94a3b8"
                                        label={{ value: 'Día del mes', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                                    />

                                    <YAxis 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        stroke="#94a3b8"
                                        allowDecimals={false}
                                        label={{ 
                                            value: 'Hábitos completados', 
                                            angle: -90, 
                                            position: 'insideLeft', 
                                            fill: '#94a3b8',
                                            dy: 50
                                        }}
                                    />

                                    {/* ✅ Tooltip mejorado */}
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                            border: '1px solid rgba(16, 185, 129, 0.5)',
                                            borderRadius: '0.75rem',
                                            padding: '12px 16px',
                                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                                        }}
                                        labelStyle={{ 
                                            color: '#10b981',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            marginBottom: '4px',
                                        }}
                                        itemStyle={{
                                            color: '#e2e8f0',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                        }}
                                        formatter={(value) => {
                                            if (value === null) return ['Sin datos aún', ''];
                                            return [`${value} ${value === 1 ? 'hábito' : 'hábitos'}`, 'Completados'];
                                        }}
                                        labelFormatter={(label) => `📅 Día ${label}`}
                                        // cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    />

                                    <Line 
                                        type="monotone" 
                                        dataKey="completed" 
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, fill: '#34d399' }}
                                        connectNulls={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.emptyChart}>
                                <p>📊 No hay datos para mostrar este mes</p>
                                <p className={styles.emptyChartSubtext}>
                                    Comenzá a completar hábitos para ver tu progreso
                                </p>
                            </div>
                        )}
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