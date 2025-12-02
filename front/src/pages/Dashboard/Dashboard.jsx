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
import ExportButton from '@/components/ExportButton/ExportButton';
import ViewToggle from '@/components/HabitListView/ViewToggle';
import listStyles from '@components/HabitListView/HabitListView.module.css';
import HabitListItem from '@/components/HabitListView/HabitListView';
import CategoryFilter from '@/CategoryFilter/CategoryFilter';
import { HABIT_CATEGORIES, getCategoryById } from '@/config/categories';

// Componente de Skeleton Loader
const SkeletonCard = () => (
    <div className={styles.skeletonCard}>
        <div className={`${styles.skeletonLine} ${styles.skeletonLineLg}`}></div>
        <div className={`${styles.skeletonLine} ${styles.skeletonLineMd}`}></div>
        <div className={`${styles.skeletonLine} ${styles.skeletonLineSm}`}></div>
    </div>
);

// Componente de Progreso Circular
const CircularProgress = ({ percentage, size = 80, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={styles.circularProgress} style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                </defs>
                <circle
                    className={styles.circularProgressBg}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <circle
                    className={styles.circularProgressFill}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    stroke="url(#gradient)"
                />
            </svg>
            <div className={styles.circularProgressText}>{percentage ? percentage : 0}%</div>
        </div>
    );
};

// 💥 FUNCIÓN PARA DISPARAR EL CONFETTI
const runConfetti = () => {
    confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
    });
};

// 🌅 Función para obtener el saludo según la hora
const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
        return {
            text: 'Buenos días',
            emoji: '☀️',
            color: '#fbbf24',
        };
    } else if (hour >= 12 && hour < 19) {
        return {
            text: 'Buenas tardes',
            emoji: '🌤️',
            color: '#f97316',
        };
    } else {
        return {
            text: 'Buenas noches',
            emoji: '🌙',
            color: '#8b5cf6',
        };
    }
};

// 💬 Función para obtener mensaje motivacional según la hora
const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
        return 'Comenzá el día con energía 💪';
    } else if (hour >= 12 && hour < 19) {
        return 'Continuá construyendo tu mejor versión 🎯';
    } else {
        return 'Reflexioná sobre tu progreso de hoy 📈';
    }
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [habits, setHabits] = useState([]);
    const [summary, setSummary] = useState(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);

    // Estados para filtros y búsqueda
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');

    // Saludo dependiendo hora
    const greeting = getGreeting();
    const motivationalMessage = getMotivationalMessage();

    // habit views
     const [viewMode, setViewMode] = useState(() => {
        const saved = localStorage.getItem('habitViewMode');
        return saved || 'grid';
    });
    
    // categorias
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Guardar preferencia cuando cambie
    useEffect(() => {
        localStorage.setItem('habitViewMode', viewMode);
    }, [viewMode]);

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

    // Filtrado, búsqueda y ordenamiento
    const filteredAndSortedHabits = useMemo(() => {
        let result = [...habits];

        // Filtro por búsqueda
        if (searchTerm.trim()) {
            result = result.filter(habit => 
                habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (habit.description && habit.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // NUEVO: Filtro por categoría
        if (selectedCategory !== 'all') {
            result = result.filter(h => h.category === selectedCategory);
        }

        // Filtro por estado (completado/pendiente)
        switch (filter) {
            case 'completed':
                result = result.filter(h => h.completedToday);
                break;
            case 'pending':
                result = result.filter(h => !h.completedToday);
                break;
            default:
                break;
        }

        // Ordenamiento
        switch (sortBy) {
            case 'streak':
                result.sort((a, b) => b.currentStreak - a.currentStreak);
                break;
            case 'recent':
                result.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
                break;
            case 'category':
                result.sort((a, b) => {
                    const catA = getCategoryById(a.category || 'otro').name;
                    const catB = getCategoryById(b.category || 'otro').name;
                    return catA.localeCompare(catB);
                });
                break;
            case 'name':
            default:
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        return result;
    }, [habits, filter, sortBy, searchTerm, selectedCategory]); 

    // Cálculo del máximo de hábitos para el eje Y
    const maxActiveHabits = useMemo(() => {
        const max = summary?.totalHabits ?? habits.length;
        const maxCompletedInMonth = monthlyData.reduce((max, item) => Math.max(max, item.completed ?? 0), 0);
        return Math.max(max, maxCompletedInMonth, 1); 
    }, [summary, habits, monthlyData]);

    const handleSaveHabit = async (habitData) => {
        try {
            if (editingHabit) {
                await habitService.update(editingHabit.id, habitData);
                toast.success('Hábito actualizado correctamente');
            } else {
                await habitService.create(habitData);
                toast.success('Hábito creado con éxito! 🎉')
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
            const scrollPosition = window.scrollY;
            const habitsBeforeCompletion = habits; 
            const pendingBefore = habitsBeforeCompletion.filter(h => !h.completedToday).length;
            
            const result = await habitService.complete(habitId);
            await loadData();
            
            toast.success('¡Hábito completado! +10 pts 🎯', {
                icon: '✅',
            });

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

            if (pendingBefore === 1) { 
                runConfetti();
                toast.success('¡Felicitaciones! 🥳 ¡Completaste todos los hábitos del día!', { 
                    duration: 6000, 
                    icon: '🎉' 
                });
            }

            setTimeout(() => {
                window.scrollTo(0, scrollPosition);
            }, 0);
            
            return result;
        } catch (error) {
            console.error('Error al completar hábito:', error);
            toast.error(error.response?.data?.message || 'Error al completar el hábito');
            throw error;
        }
    };

    const handleUncomplete = async (habitId) => {
        try {
            const scrollPosition = window.scrollY;
            
            await habitService.uncomplete(habitId);
            await loadData();

            toast('Hábito desmarcado', {
                icon: ':('
            });
            
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

    const handleCompleteAll = async () => {
        const pendingHabits = habits.filter(h => !h.completedToday);
        
        try {
            for (const habit of pendingHabits) {
                await habitService.complete(habit.id);
            }
            await loadData();
            runConfetti();
            toast.success('¡Todos los hábitos completados! 🎉', {
                duration: 5000,
                icon: '🏆'
            });
        } catch (error) {
            console.error('Error al completar todos los hábitos:', error);
            toast.error('Error al completar todos los hábitos');
        }
    };

    const getCurrentMonthName = () => {
        const monthName = new Date().toLocaleDateString('es-AR', { month: 'long' });
        return monthName.charAt(0).toUpperCase() + monthName.slice(1);
    };

    if (loading) {
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
                            
                            <Link to="/profile" className={styles.profileButton}>
                                {user?.avatar ? (
                                    <img 
                                        src={`http://localhost:3000${user.avatar}`}
                                        alt={user.name}
                                        className={styles.avatarSmall}
                                    />
                                ) : (
                                    <div className={styles.avatarSmallPlaceholder}>
                                        {user?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                                <span className={styles.profileName}>{user?.name}</span>
                            </Link>

                            <button onClick={logout} className={styles.logoutBtn}>
                                Salir
                            </button>
                        </div>
                    </div>
                </nav>

                <div className={styles.loadingState}>
                    <div className={styles.loadingHeader}>
                        <div className={`${styles.skeletonLine} ${styles.skeletonLineXl}`}></div>
                        <div className={`${styles.skeletonLine} ${styles.skeletonLineLg}`}></div>
                    </div>
                    <div className={styles.statsGrid}>
                        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                    <div className={styles.chartSkeleton}>
                        <div className={`${styles.skeletonLine} ${styles.skeletonLineLg}`}></div>
                        <div className={styles.skeletonChartBox}></div>
                    </div>
                </div>
            </div>
        );
    }

    const completionPercentage = summary ? Math.round((summary.completedToday / summary.totalHabits) * 100) : 0;
    const pendingCount = habits.filter(h => !h.completedToday).length;

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
                        
                        <Link to="/profile" className={styles.profileButton}>
                            {user?.avatar ? (
                                <img 
                                    src={`http://localhost:3000${user.avatar}`}
                                    alt={user.name}
                                    className={styles.avatarSmall}
                                />
                            ) : (
                                <div className={styles.avatarSmallPlaceholder}>
                                    {user?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}
                            <span className={styles.profileName}>{user?.name}</span>
                        </Link>

                        <button onClick={logout} className={styles.logoutBtn}>
                            Salir
                        </button>
                    </div>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <h1 
                            className={styles.heroTitle}
                            style={{
                                background: `linear-gradient(135deg, ${greeting.color} 0%, #10b981 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            {greeting.emoji} {greeting.text}, {user?.name}!
                        </h1>
                        <p className={styles.heroSubtitle}>
                            {motivationalMessage}
                        </p>
                    </div>
                    
                    <div className={styles.heroProgress}>
                        <CircularProgress percentage={completionPercentage} />
                        <div className={styles.heroProgressInfo}>
                            <p className={styles.progressLabel}>Progreso de hoy</p>
                            <p className={styles.progressValue}>
                                {summary?.completedToday} de {summary?.totalHabits} completados
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                {pendingCount > 0 && (
                    <div className={styles.quickActionsBanner}>
                        <div className={styles.quickActionsContent}>
                            <span className={styles.quickActionsIcon}>⚡</span>
                            <div>
                                <p className={styles.quickActionsTitle}>
                                    Tenés {pendingCount} {pendingCount === 1 ? 'hábito pendiente' : 'hábitos pendientes'}
                                </p>
                                <p className={styles.quickActionsSubtitle}>
                                    ¡Estás a pocos pasos de completar tu día!
                                </p>
                            </div>
                        </div>
                        <button onClick={handleCompleteAll} className={styles.quickActionBtn}>
                            Completar todos
                        </button>
                    </div>
                )}

                {/* Stats Grid */}
                {summary && (
                    <div className={styles.statsGrid}>
                        <div className={`${styles.statCard} ${styles.statCardPulse}`}>
                            <div className={styles.statIconWrapper}>
                                <span className={styles.statIcon}>🎯</span>
                            </div>
                            <div className={styles.statContent}>
                                <p className={styles.statValue}>{summary.totalHabits}</p>
                                <p className={styles.statLabel}>Hábitos activos</p>
                                <div className={`${styles.statTrend} ${styles.positive}`}>
                                    <span className={styles.trendIcon}>↗</span>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.statCard} ${styles.statCardPulse}`} style={{ animationDelay: '0.1s' }}>
                            <div className={styles.statIconWrapper}>
                                <span className={styles.statIcon}>✅</span>
                            </div>
                            <div className={styles.statContent}>
                                <p className={styles.statValue}>{summary.completedToday}</p>
                                <p className={styles.statLabel}>Completados hoy</p>
                                <div className={styles.statProgress}>
                                    <div 
                                        className={styles.statProgressBar}
                                        style={{ width: `${completionPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.statCard} ${styles.statCardPulse}`} style={{ animationDelay: '0.2s' }}>
                            <div className={styles.statIconWrapper}>
                                <span className={styles.statIcon}>📊</span>
                            </div>
                            <div className={styles.statContent}>
                                <p className={styles.statValue}>{summary.monthlyCompletionRate}%</p>
                                <p className={styles.statLabel}>Tasa mensual</p>
                                <p className={styles.statSubtext}>
                                    {summary.monthlyCompletions}/{summary.possibleCompletions} completados
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chart Section */}
                <div className={styles.chartSection}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>📈 Progreso de {getCurrentMonthName()}</h3>
                        <div className={styles.chartLegend}>
                            <span className={styles.legendItem}>
                                <span className={styles.legendDot}></span>
                                Hábitos completados
                            </span>
                        </div>
                    </div>
                    
                    <div className={styles.chartContainer}>
                        {monthlyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                                    
                                    <XAxis 
                                        dataKey="day"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        stroke="#334155"
                                    />

                                    <YAxis
                                        tickCount={maxActiveHabits + 1}
                                        domain={[0, maxActiveHabits]}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        stroke="#334155"
                                        allowDecimals={false}
                                    />

                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                        }}
                                        labelStyle={{ color: '#10b981', fontWeight: '600' }}
                                        itemStyle={{ color: '#e2e8f0' }}
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
                                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#34d399' }}
                                        fill="url(#colorCompleted)"
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

                {/* Habits Section */}
                <div className={styles.habitsSection}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Mis Hábitos</h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* NUEVO: Toggle de vista */}
                            <ViewToggle 
                                view={viewMode} 
                                onViewChange={setViewMode} 
                            />

                        {/* Botón de exportar */}
                        {habits.length > 0 && (
                            <ExportButton 
                                habits={habits}
                                summary={summary}
                                userName={user?.name}
                            />
                        )}
                        <button onClick={handleNewHabit} className={styles.addButton}>
                            <span className={styles.addIcon}>+</span>
                            Nuevo Hábito
                        </button>
                        </div>
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
                        {/* Filtro de categorías */}
                            <CategoryFilter
                                selectedCategory={selectedCategory}
                                onCategoryChange={setSelectedCategory}
                                habits={habits}
                            />
                            {/* Barra de filtros y búsqueda */}
                            <div className={styles.filtersBar}>
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
                                        <option value="category">Por categoría</option>
                                    </select>
                                </div>
                            </div>

                            {/* Contador de resultados */}
                            {(searchTerm || filter !== 'all' || selectedCategory !== 'all' ) && (
                                <div className={styles.resultsInfo}>
                                    Mostrando {filteredAndSortedHabits.length} de {habits.length} hábitos
                                    {(searchTerm || selectedCategory !== 'all') && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                    setFilter('all');
                                                    setSelectedCategory('all');
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
                                <>
                                    {/* Vista GRID (Cards) */}
                                    {viewMode === 'grid' && (
                                        <div className={styles.habitsList}>
                                            {filteredAndSortedHabits.map((habit, index) => (
                                                <div 
                                                    key={habit.id}
                                                    className={styles.habitCardWrapper}
                                                    style={{ animationDelay: `${index * 0.05}s` }}
                                                >
                                                    <HabitCard
                                                        habit={habit}
                                                        onComplete={handleComplete}
                                                        onUncomplete={handleUncomplete}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Vista LIST (Compacta) - NUEVO */}
                                    {viewMode === 'list' && (
                                        <div className={listStyles.listContainer}>
                                            {filteredAndSortedHabits.map((habit) => (
                                                <HabitListItem
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