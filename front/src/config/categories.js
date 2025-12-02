// src/config/categories.js
// Categorías predefinidas para hábitos

export const HABIT_CATEGORIES = [
    {
        id: 'salud',
        name: 'Salud',
        icon: '💪',
        color: '#10b981',
        description: 'Ejercicio, alimentación, bienestar físico'
    },
    {
        id: 'productividad',
        name: 'Productividad',
        icon: '⚡',
        color: '#3b82f6',
        description: 'Trabajo, estudio, desarrollo profesional'
    },
    {
        id: 'mindfulness',
        name: 'Mindfulness',
        icon: '🧘',
        color: '#8b5cf6',
        description: 'Meditación, respiración, atención plena'
    },
    {
        id: 'aprendizaje',
        name: 'Aprendizaje',
        icon: '📚',
        color: '#f59e0b',
        description: 'Lectura, cursos, nuevas habilidades'
    },
    {
        id: 'creatividad',
        name: 'Creatividad',
        icon: '🎨',
        color: '#ec4899',
        description: 'Arte, música, escritura, proyectos creativos'
    },
    {
        id: 'social',
        name: 'Social',
        icon: '👥',
        color: '#06b6d4',
        description: 'Relaciones, familia, amigos, networking'
    },
    {
        id: 'finanzas',
        name: 'Finanzas',
        icon: '💰',
        color: '#84cc16',
        description: 'Ahorro, inversiones, control de gastos'
    },
    {
        id: 'hogar',
        name: 'Hogar',
        icon: '🏠',
        color: '#f97316',
        description: 'Limpieza, organización, mantenimiento'
    },
    {
        id: 'otro',
        name: 'Otro',
        icon: '📌',
        color: '#64748b',
        description: 'Otros hábitos personalizados'
    }
];

// Función helper para obtener categoría por ID
export const getCategoryById = (categoryId) => {
    return HABIT_CATEGORIES.find(cat => cat.id === categoryId) || HABIT_CATEGORIES[8]; // Default: 'otro'
};

// Función helper para obtener color de categoría
export const getCategoryColor = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category.color;
};

// Función helper para obtener icono de categoría
export const getCategoryIcon = (categoryId) => {
    const category = getCategoryById(categoryId);
    return category.icon;
};