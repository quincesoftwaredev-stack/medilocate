export const emptyDashboard = {
    meta: {
        period: "last_7_days",
        startDate: "",
        endDate: "",
    },
    kpis: {
        deliveredRevenue: 0,
        deliveredOrders: 0,
        totalOrders: 0,
        pendingOrders: 0,
        pendingPrescriptions: 0,
        lowStockMedicines: 0,
        todayAppointments: 0,
        averageOrderValue: 0,
        completionRate: 0,
    },
    actionRequired: {},
    orders: { statuses: {}, sources: {}, trend: [], recent: [] },
    prescriptions: { statuses: {}, recent: [] },
    inventory: { alerts: [], bestSelling: [] },
    doctors: {},
    appointments: { statuses: {} },
};

export const formatCurrency = (value) =>
    new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export const formatDateTime = (value) => {
    if (!value) return "N/A";

    return new Intl.DateTimeFormat("en-BD", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
};

export const humanizeStatus = (value = "") =>
    value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const getPeriodLabel = (query = {}, meta = {}) => {
    if (query.startDate && query.endDate) {
        return `${query.startDate} — ${query.endDate}`;
    }

    switch (query.period || meta.period) {
        case "today":
            return "Today";
        case "last_30_days":
            return "Last 30 days";
        case "custom":
            return meta.startDate && meta.endDate
                ? `${meta.startDate} — ${meta.endDate}`
                : "Custom range";
        default:
            return "Last 7 days";
    }
};

