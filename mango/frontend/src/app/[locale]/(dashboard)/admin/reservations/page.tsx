import { AdminReservationHistoryView } from "@/src/features/admin-umkm/views/AdminReservationHistoryView";

export async function generateMetadata() {
  return { title: "Riwayat Reservasi — MANGO Admin" };
}

export default function AdminReservationsPage() {
  return <AdminReservationHistoryView />;
}
