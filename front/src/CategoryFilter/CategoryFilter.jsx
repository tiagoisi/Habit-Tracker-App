import { HABIT_CATEGORIES } from '../config/categories';
import styles from '../pages/Dashboard/Dashboard.module.css';

const CategoryFilter = ({ selectedCategory, onCategoryChange, habits = [] }) => {
    // Contar hábitos por categoría
    const getCategoryCount = (categoryId) => {
        if (categoryId === 'all') {
            return habits.length;
        }
        return habits.filter(habit => habit.category === categoryId).length;
    };

    // Convertir color hex a RGB para CSS variables
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '16, 185, 129';
    };

    return (
        <div className={styles.categoryFilter}>
            <span className={styles.categoryFilterLabel}>Categorías:</span>
            
            <div className={styles.categoryChips}>
                {/* Opción "Todas" */}
                <button
                    onClick={() => onCategoryChange('all')}
                    className={`${styles.categoryChip} ${styles.all} ${selectedCategory === 'all' ? styles.active : ''}`}
                >
                    <span className={styles.categoryIcon}>📋</span>
                    <span className={styles.categoryName}>Todas</span>
                    <span className={styles.categoryCount}>{habits.length}</span>
                </button>

                {/* Categorías */}
                {HABIT_CATEGORIES.map((category) => {
                    const count = getCategoryCount(category.id);
                    
                    // No mostrar categorías sin hábitos (opcional)
                    // if (count === 0) return null;

                    return (
                        <button
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                            className={`${styles.categoryChip} ${selectedCategory === category.id ? styles.active : ''}`}
                            style={{
                                '--category-color': category.color,
                                '--category-color-rgb': hexToRgb(category.color),
                            }}
                            title={category.description}
                        >
                            <span className={styles.categoryIcon}>{category.icon}</span>
                            <span className={styles.categoryName}>{category.name}</span>
                            {count > 0 && (
                                <span className={styles.categoryCount}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryFilter;