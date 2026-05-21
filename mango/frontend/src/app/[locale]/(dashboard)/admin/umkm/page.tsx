import { AdminUmkmListView } from "@/src/features/admin-umkm/views/AdminUmkmListView";

export async function generateMetadata() {
  return { title: "Daftar UMKM — MANGO Admin" };
}

export default function AdminUmkmListPage() {
  return <AdminUmkmListView />;
}
