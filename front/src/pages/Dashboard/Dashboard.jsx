import { useEffect, useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { habitService } from '@services/habitService';
import HabitCard from '@components/HabitCard/HabitCard';
import HabitModal from '@components/HabitModal/HabitModal';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [habits, setHabits] = useState([]);
    const [summary, setSummary] = useState(null);
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
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <img 
                        src="/logo.png" 
                        alt="Daily Forge" 
                        className={styles.logo}
                    />
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
            </header>

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