import Head from "next/head";
import { useRouter } from "next/router";

import ActionRequired from "./ActionRequired";
import DashboardCharts from "./DashboardCharts";
import DashboardFilters from "./DashboardFilters";
import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import DoctorOverview from "./DoctorOverview";
import InventoryOverview from "./InventoryOverview";
import OrderPipeline from "./OrderPipeline";
import PrescriptionOverview from "./PrescriptionOverview";
import QuickActions from "./QuickActions";
import RecentOrders from "./RecentOrders";
import { emptyDashboard, getPeriodLabel } from "./dashboardData";

import styles from "@/styles/Admin/NewAdmin.module.css";

export default function NewAdmin({ dashboard = emptyDashboard }) {
    const router = useRouter();
    const source = dashboard || emptyDashboard;
    const data = {
        ...emptyDashboard,
        ...source,
        kpis: { ...emptyDashboard.kpis, ...source.kpis },
        orders: { ...emptyDashboard.orders, ...source.orders },
        prescriptions: { ...emptyDashboard.prescriptions, ...source.prescriptions },
        inventory: { ...emptyDashboard.inventory, ...source.inventory },
        doctors: { ...emptyDashboard.doctors, ...source.doctors },
        appointments: { ...emptyDashboard.appointments, ...source.appointments },
    };

    const updateFilters = (nextFilters) => {
        const query = {};
        if (nextFilters.period) query.period = nextFilters.period;
        if (nextFilters.startDate) query.startDate = nextFilters.startDate;
        if (nextFilters.endDate) query.endDate = nextFilters.endDate;
        router.push({ pathname: "/admin", query });
    };

    return (
        <>
            <Head>
                <title>Operations Dashboard | MediLocate Admin</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>

            <main className={styles.page}>
                <div className={styles.container}>
                    <DashboardHeader
                        periodLabel={getPeriodLabel(router.query, data.meta)}
                        onRefresh={() => router.replace(router.asPath)}
                    />
                    <DashboardFilters query={router.query} onChange={updateFilters} />
                    <DashboardStats kpis={data.kpis} />
                    <ActionRequired data={data.actionRequired} />
                    <DashboardCharts
                        data={data.orders.trend}
                        kpis={data.kpis}
                        sources={data.orders.sources}
                    />
                    <OrderPipeline
                        statuses={data.orders.statuses}
                        sources={data.orders.sources}
                    />
                    <div className={styles.operationsGrid}>
                        <PrescriptionOverview data={data.prescriptions} />
                        <DoctorOverview
                            doctors={data.doctors}
                            appointments={data.appointments}
                        />
                    </div>
                    <RecentOrders orders={data.orders.recent} />
                    <InventoryOverview inventory={data.inventory} />
                    <QuickActions />
                </div>
            </main>
        </>
    );
}
