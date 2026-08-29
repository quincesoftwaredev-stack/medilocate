import axios from "axios";
import { parse } from "cookie";

import NewAdmin from "@/components/NewAdmin";

export default function AdminPage({ dashboard }) {
    return <NewAdmin dashboard={dashboard} />;
}
export async function getServerSideProps(context) {
    const { req, query } = context;

    try {
        const cookies = parse(req.headers.cookie || "");
        const userInfo = cookies.userInfo
            ? JSON.parse(cookies.userInfo)
            : null;

        if (!userInfo?.token) {
            return {
                redirect: {
                    destination: "/login",
                    permanent: false,
                },
            };
        }

        const forwardedProtocol = req.headers["x-forwarded-proto"];
        const protocol = forwardedProtocol
            ? forwardedProtocol.split(",")[0]
            : "http";
        const host = req.headers["x-forwarded-host"] || req.headers.host;
        const params = new URLSearchParams();

        if (query.period) params.set("period", query.period);
        if (query.startDate) params.set("startDate", query.startDate);
        if (query.endDate) params.set("endDate", query.endDate);

        const response = await axios.get(
            `${protocol}://${host}/api/admin/dashboard?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    Cookie: req.headers.cookie || "",
                },
            }
        );

        return {
            props: {
                dashboard: response.data?.success ? response.data : null,
            },
        };
    } catch (error) {
        console.error(
            "Admin operations dashboard data error:",
            error.response?.data || error.message
        );

        return {
            props: {
                dashboard: null,
            },
        };
    }
}
