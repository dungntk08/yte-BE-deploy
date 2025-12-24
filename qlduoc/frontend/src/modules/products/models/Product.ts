export interface Product {
    id?: string;
    account_id?: string;
    category_id?: string | null;
    
    // Basic Info
    code: string | null;
    name: string;
    unit: string | null;
    price: number;
    min_stock: number;
    stock?: number; // Calculated, generic stock total

    // Detailed Pharma Info
    material_type?: string | null;
    drug_type?: string | null;
    concentration?: string | null;
    active_ingredient?: string | null;
    active_ingredient_code?: string | null;
    registration_number?: string | null;
    usage_route?: string | null;
    dosage?: string | null;
    pharma_type?: string | null;
    pharma_group?: string | null;
    drug_group?: string | null;
    insurance_group?: string | null;
    dmdc_code?: string | null;
    byt_decision_name?: string | null;
    packaging_spec?: string | null;
    program?: string | null;
    indication?: string | null;
    insurance_coverage_rate?: number | null;
    goods_code?: string | null;
    prescription_unit?: string | null;
    qd130_code?: string | null;
    funding_source?: string | null;

    created_at?: string;
    updated_at?: string;
}

export interface ProductResponse {
    data: Product[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
}
