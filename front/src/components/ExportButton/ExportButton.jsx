import { useState, useRef, useEffect } from 'react';
import styles from './ExportButton.module.css';
import toast from 'react-hot-toast';

// 📊 Función para exportar a CSV
const exportToCSV = (habits, summary) => {
    try {
        // Preparar datos de hábitos
        const habitRows = habits.map(habit => ({
            'Nombre': habit.title,
            'Descripción': habit.description || '',
            'Icono': habit.icon || '',
            'Racha Actual': habit.currentStreak,
            'Racha Récord': habit.longestStreak,
            'Total Completados': habit.totalCompletions,
            'Completado Hoy': habit.completedToday ? 'Sí' : 'No',
            'Tasa Mensual': `${habit.monthlyHabitRate || 0}%`,
            'Fecha Creación': new Date(habit.createdAt).toLocaleDateString('es-AR'),
        }));

        if (habitRows.length === 0) {
            toast.error('No hay hábitos para exportar');
            return;
        }

        // Crear el CSV
        const headers = Object.keys(habitRows[0]).join(',');
        const rows = habitRows.map(row => 
            Object.values(row).map(val => `"${val}"`).join(',')
        ).join('\n');

        const csv = `${headers}\n${rows}`;

        // Agregar resumen al final
        const summarySection = `\n\n"RESUMEN"\n"Total de hábitos","${summary?.totalHabits || 0}"\n"Completados hoy","${summary?.completedToday || 0}"\n"Tasa mensual","${summary?.monthlyCompletionRate || 0}%"\n"Fecha de exportación","${new Date().toLocaleString('es-AR')}"`;
        
        const finalCSV = csv + summarySection;

        // Descargar archivo
        const blob = new Blob(['\ufeff' + finalCSV], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `daily-forge-habitos-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('CSV exportado exitosamente! 📊');
    } catch (error) {
        console.error('Error al exportar CSV:', error);
        toast.error('Error al exportar CSV');
    }
};

// 📄 Función para exportar a PDF
const exportToPDF = (habits, summary, userName) => {
    try {
        if (habits.length === 0) {
            toast.error('No hay hábitos para exportar');
            return;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('es-AR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Crear HTML para el PDF
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte de Hábitos - Daily Forge</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 40px;
            background: white;
            color: #1a1a1a;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #10b981;
        }
        .logo {
            font-size: 32px;
            font-weight: 800;
            color: #10b981;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
        }
        .user-info {
            text-align: center;
            margin-bottom: 30px;
            font-size: 18px;
            color: #333;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #10b981;
        }
        .summary-card h3 {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }
        .summary-card p {
            font-size: 28px;
            font-weight: 700;
            color: #10b981;
        }
        .habits-section {
            margin-top: 30px;
        }
        .section-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #1a1a1a;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        thead {
            background: #10b981;
            color: white;
        }
        th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        tbody tr:nth-child(even) {
            background: #f9fafb;
        }
        .completed {
            color: #10b981;
            font-weight: 600;
        }
        .pending {
            color: #ef4444;
            font-weight: 600;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .habit-icon {
            font-size: 18px;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🔥 Daily Forge</div>
        <div class="subtitle">Reporte de Hábitos</div>
    </div>

    <div class="user-info">
        <strong>${userName || 'Usuario'}</strong> - ${dateStr}
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total de Hábitos</h3>
            <p>${summary?.totalHabits || 0}</p>
        </div>
        <div class="summary-card">
            <h3>Completados Hoy</h3>
            <p>${summary?.completedToday || 0}</p>
        </div>
        <div class="summary-card">
            <h3>Tasa Mensual</h3>
            <p>${summary?.monthlyCompletionRate || 0}%</p>
        </div>
    </div>

    <div class="habits-section">
        <h2 class="section-title">Mis Hábitos</h2>
        <table>
            <thead>
                <tr>
                    <th>Hábito</th>
                    <th>Estado</th>
                    <th>Racha</th>
                    <th>Récord</th>
                    <th>Total</th>
                    <th>Tasa Mensual</th>
                </tr>
            </thead>
            <tbody>
                ${habits.map(habit => `
                    <tr>
                        <td>
                            <span class="habit-icon">${habit.icon || '📝'}</span>
                            <strong>${habit.title}</strong>
                            ${habit.description ? `<br><small style="color: #666;">${habit.description}</small>` : ''}
                        </td>
                        <td class="${habit.completedToday ? 'completed' : 'pending'}">
                            ${habit.completedToday ? '✓ Completado' : '○ Pendiente'}
                        </td>
                        <td>${habit.currentStreak} días</td>
                        <td>${habit.longestStreak} días</td>
                        <td>${habit.totalCompletions}</td>
                        <td>${habit.monthlyHabitRate || 0}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        Generado el ${now.toLocaleString('es-AR')} | Daily Forge - Construí tu mejor versión
    </div>
</body>
</html>
        `;

        // Abrir en nueva ventana para imprimir/guardar como PDF
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Esperar a que cargue y luego abrir diálogo de impresión
        printWindow.onload = () => {
            printWindow.print();
        };

        toast.success('Abriendo vista de impresión PDF... 📄');
    } catch (error) {
        console.error('Error al exportar PDF:', error);
        toast.error('Error al exportar PDF');
    }
};

// Componente principal
const ExportButton = ({ habits = [], summary = null, userName = 'Usuario' }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleExportCSV = () => {
        setLoading(true);
        setTimeout(() => {
            exportToCSV(habits, summary);
            setLoading(false);
            setShowDropdown(false);
        }, 300);
    };

    const handleExportPDF = () => {
        setLoading(true);
        setTimeout(() => {
            exportToPDF(habits, summary, userName);
            setLoading(false);
            setShowDropdown(false);
        }, 300);
    };

    return (
        <div className={styles.exportContainer} ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={styles.exportButton}
                disabled={loading || habits.length === 0}
            >
                {loading ? (
                    <span className={styles.spinner}></span>
                ) : (
                    <span className={styles.exportIcon}>📥</span>
                )}
                <span>Exportar Datos</span>
            </button>

            {showDropdown && (
                <div className={styles.exportDropdown}>
                    <button
                        onClick={handleExportCSV}
                        className={styles.dropdownItem}
                    >
                        <span className={styles.dropdownIcon}>📊</span>
                        <span>Exportar como CSV</span>
                    </button>

                    <div className={styles.dropdownDivider}></div>

                    <button
                        onClick={handleExportPDF}
                        className={styles.dropdownItem}
                    >
                        <span className={styles.dropdownIcon}>📄</span>
                        <span>Exportar como PDF</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportButton;