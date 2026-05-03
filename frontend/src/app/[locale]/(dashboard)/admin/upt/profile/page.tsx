"use client";

import { OrganizationInfoView } from "@/src/features/admin-org/views/OrganizationInfoView";

// UPT Org Profile
export default function UptProfilePage() {
    return (
        <OrganizationInfoView 
            pageTitle="Profil Organisasi" 
            pageSubtitle="Kelola identitas organisasi UPT dalam ekosistem MANGO." 
        />
    );
}
