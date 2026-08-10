export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
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
};
