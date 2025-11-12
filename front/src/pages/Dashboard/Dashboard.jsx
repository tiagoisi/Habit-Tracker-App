import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { habitService } from '@services/habitService';
import HabitCard from '@components/HabitCard/HabitCard';
import HabitModal from '@components/HabitModal/HabitModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

// 💥 FUNCIÓN PARA DISPARAR EL CONFETI
const runConfetti = () => {
    confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
    });
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [habits, setHabits] = useState([]);
    const [summary, setSummary] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);

    // ✅ Estados para filtros y búsqueda
    const [filter, setFilter] = useState('all'); // 'all', 'completed', 'pending'
    const [sortBy, setSortBy] = useState('name'); // 'name', 'streak', 'recent'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [habitsData, summaryData, monthlyStats] = await Promise.all([
                habitService.getAll(),
                habitService.getTodaySummary(),
                habitService.getMonthlyStats(),
            ]);
            setHabits(habitsData);
            setSummary(summaryData);
            setMonthlyData(monthlyStats.data || []);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Filtrado, búsqueda y ordenamiento con useMemo
    const filteredAndSortedHabits = useMemo(() => {
        let result = [...habits];

        // 1. Aplicar búsqueda
        if (searchTerm.trim()) {
            result = result.filter(habit => 
                habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (habit.description && habit.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // 2. Aplicar filtro
        switch (filter) {
            case 'completed':
                result = result.filter(h => h.completedToday);
                break;
            case 'pending':
                result = result.filter(h => !h.completedToday);
                break;
            default:
                // 'all' - no filtrar
                break;
        }

        // 3. Aplicar ordenamiento
        switch (sortBy) {
            case 'streak':
                result.sort((a, b) => b.currentStreak - a.currentStreak);
                break;
            case 'recent':
                result.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
                break;
            case 'name':
            default:
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        return result;
    }, [habits, filter, sortBy, searchTerm]);

    // ✅ Cálculo del máximo de hábitos para el eje Y (Paso 1)
    const maxActiveHabits = useMemo(() => {
        // Usamos el total de hábitos del resumen. Si no está disponible, usamos el length.
        const max = summary?.totalHabits ?? habits.length;
        
        // El máximo de la data mensual puede ser diferente al total de hábitos (si la API tiene un error)
        // Por seguridad, encontramos el máximo de hábitos completados en la data mensual.
        const maxCompletedInMonth = monthlyData.reduce((max, item) => Math.max(max, item.completed ?? 0), 0);
        
        // Usamos el mayor de los dos (Total de Hábitos vs Máximo completado en la data) para asegurar que el gráfico contenga la línea.
        return Math.max(max, maxCompletedInMonth, 1); 
    }, [summary, habits, monthlyData]);

    const handleSaveHabit = async (habitData) => {
        try {
            if (editingHabit) {
                await habitService.update(editingHabit.id, habitData);
                toast.success('Hábito actualizado correctamente');
            } else {
                await habitService.create(habitData);
                toast.success('Hábito creado con exito!🎉')
            }
            await loadData();
            setIsModalOpen(false);
            setEditingHabit(null);
        } catch (error) {
            console.error('Error al guardar hábito:', error);
            toast.error('Error al guardar el hábito :(');
            throw error;
        }
    };

    const handleComplete = async (habitId) => {
        try {
            // ✅ Guardar posición actual del scroll
            const scrollPosition = window.scrollY;

            // 💥 LÓGICA DE CONFETI: Determinar si este es el último pendiente ANTES de completar
            const habitsBeforeCompletion = habits; 
            const pendingBefore = habitsBeforeCompletion.filter(h => !h.completedToday).length;
            
            const result = await habitService.complete(habitId);
            await loadData(); // Recargar datos para el estado actualizado
            
            // ✅ Toast de éxito con puntos ganados
            toast.success('¡Hábito completado! +10 pts 🎯', {
                icon: '✅',
            });

            // ✅ Si hay logros nuevos, mostrar toast especial
            if (result.newAchievements && result.newAchievements.length > 0) {
                result.newAchievements.forEach((achievement) => {
                    toast.success(
                        `¡Logro desbloqueado! ${achievement.icon} ${achievement.title} (+${achievement.pointsReward} pts)`,
                        {
                            duration: 5000,
                            icon: '🏆',
                        }
                    );
                });
            }

            // 💥 LÓGICA DE CONFETI: Si quedaba solo 1 pendiente (el que acabamos de completar), lanzamos confeti
            if (pendingBefore === 1) { 
                runConfetti();
                toast.success('¡Felicitaciones! 🥳 ¡Completaste todos los hábitos del día!', { 
                    duration: 6000, 
                    icon: '🎉' 
                });
            }

            // ✅ Restaurar posición después de recargar
            setTimeout(() => {
                window.scrollTo(0, scrollPosition);
            }, 0);
            
            return result;
        } catch (error) {
            console.error('Error al completar hábito:', error);
            // ✅ Toast de error
            toast.error(error.response?.data?.message || 'Error al completar el hábito');
            throw error;
        }
    };

    const handleUncomplete = async (habitId) => {
        try {
            // ✅ Guardar posición actual del scroll
            const scrollPosition = window.scrollY;
            
            await habitService.uncomplete(habitId);
            await loadData();

            toast('Hábito desmarcado', {
                icon: ':('
            });
            
            // ✅ Restaurar posición después de recargar
            setTimeout(() => {
                window.scrollTo(0, scrollPosition);
            }, 0);
        } catch (error) {
            console.error('Error al desmarcar hábito:', error);
            toast.error('Error al desmarcar el hábito :(');
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
                toast.success('Hábito eliminado correctamente');
            } catch (error) {
                console.error('Error al eliminar hábito:', error);
                toast.error('Error al eliminar el hábito :(');
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

    // obtener el nombre del mes
    const getCurrentMonthName = () => {
        const monthName = new Date().toLocaleDateString('es-AR', { month: 'long' });
        return monthName.charAt(0).toUpperCase() + monthName.slice(1);
    };

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
                                <p className={styles.statValue}>{summary.monthlyCompletionRate}%</p>
                                <p className={styles.statLabel}>Tasa de completación</p>
                                <p className={styles.statSubtext}>
                                    {summary.monthlyCompletions} de {summary.possibleCompletions} este mes
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gráfico de progreso mensual */}
                <div className={styles.chartSection}>
                    <h3 className={styles.chartTitle}>Progreso de {getCurrentMonthName()}</h3>
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
                                        tickCount={maxActiveHabits + 1} // <-- Uso del valor dinámico
                                        domain={[0, maxActiveHabits]} // <-- Esto ayuda a que el gráfico tenga el rango correcto
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
                        <>
                            {/* ✅ Barra de filtros y búsqueda */}
                            <div className={styles.filtersBar}>
                                {/* Búsqueda */}
                                <div className={styles.searchBox}>
                                    <span className={styles.searchIcon}>🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Buscar hábitos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={styles.searchInput}
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className={styles.clearSearch}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Filtros */}
                                <div className={styles.filterButtons}>
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                                    >
                                        Todos ({habits.length})
                                    </button>
                                    <button
                                        onClick={() => setFilter('completed')}
                                        className={`${styles.filterBtn} ${filter === 'completed' ? styles.active : ''}`}
                                    >
                                        ✓ Completados ({habits.filter(h => h.completedToday).length})
                                    </button>
                                    <button
                                        onClick={() => setFilter('pending')}
                                        className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
                                    >
                                        ○ Pendientes ({habits.filter(h => !h.completedToday).length})
                                    </button>
                                </div>

                                {/* Ordenamiento */}
                                <div className={styles.sortBox}>
                                    <label className={styles.sortLabel}>Ordenar:</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className={styles.sortSelect}
                                    >
                                        <option value="name">Nombre A-Z</option>
                                        <option value="streak">Mayor racha</option>
                                        <option value="recent">Más reciente</option>
                                    </select>
                                </div>
                            </div>

                            {/* Contador de resultados */}
                            {(searchTerm || filter !== 'all') && (
                                <div className={styles.resultsInfo}>
                                    Mostrando {filteredAndSortedHabits.length} de {habits.length} hábitos
                                    {searchTerm && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setFilter('all');
                                            }}
                                            className={styles.clearFilters}
                                        >
                                            Limpiar filtros
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Lista de hábitos filtrados */}
                            {filteredAndSortedHabits.length === 0 ? (
                                <div className={styles.noResults}>
                                    <div className={styles.noResultsIcon}>🔍</div>
                                    <p className={styles.noResultsText}>
                                        No se encontraron hábitos
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilter('all');
                                        }}
                                        className={styles.resetFiltersBtn}
                                    >
                                        Ver todos los hábitos
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.habitsList}>
                                    {filteredAndSortedHabits.map((habit) => (
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
                        </>
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