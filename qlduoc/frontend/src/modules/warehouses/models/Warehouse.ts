export interface Warehouse {
    id: string;
    code: string;
    name: string;
    type?: string;
    department?: string;
    is_pharmacy: boolean;
    active: boolean;
    created_at?: string;
    updated_at?: string;
}
