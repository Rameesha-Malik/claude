export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    /** True only for accounts with the 'content_manager' role -- drives which admin nav links render. */
    isContentManager?: boolean;
    // Rest of the model is spread onto this prop too (see
    // HandleInertiaRequests) -- the fields the self-service Profile page
    // and its Biodata section actually read/write.
    phone?: string | null;
    avatar_path?: string | null;
    address?: string | null;
    test_center?: string | null;
    target_exam_name?: string | null;
    matric_marks_percentage?: number | null;
    fsc_marks_percentage?: number | null;
    graduation_gpa?: string | null;
}

export interface SiteSettings {
    name: string;
    tagline: string | null;
    supportEmail: string | null;
    officeLocation: string | null;
    officeHours: string | null;
    whatsappNumber: string | null;
    whatsappEnabled: boolean;
    copyrightText: string | null;
    logoPath: string | null;
    social: {
        facebook: string | null;
        instagram: string | null;
        youtube: string | null;
    };
}

export interface NavLink {
    id: number;
    label: string;
    url: string;
    parent_id?: number | null;
    children?: NavLink[];
}

export interface SiteNav {
    header: NavLink[];
    footer: NavLink[];
}

export interface Announcement {
    message: string;
    link_url: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    site: SiteSettings;
    nav: SiteNav;
    announcement: Announcement | null;
    unreadNotificationsCount: number;
    features: Record<string, boolean>;
};
