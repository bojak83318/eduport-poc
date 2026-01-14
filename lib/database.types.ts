export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    created_at: string
                    subscription_tier: string
                    monthly_usage: number
                    last_reset_at: string
                }
                Insert: {
                    id: string
                    email: string
                    created_at?: string
                    subscription_tier?: string
                    monthly_usage?: number
                    last_reset_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    created_at?: string
                    subscription_tier?: string
                    monthly_usage?: number
                    last_reset_at?: string
                }
            }
            conversions: {
                Row: {
                    id: string
                    user_id: string | null
                    wordwall_url: string
                    wordwall_id: string | null
                    template_type: string
                    status: string
                    error_message: string | null
                    h5p_package_url: string | null
                    latency_ms: number | null
                    created_at: string
                    completed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    wordwall_url: string
                    wordwall_id?: string | null
                    template_type: string
                    status: string
                    error_message?: string | null
                    h5p_package_url?: string | null
                    latency_ms?: number | null
                    created_at?: string
                    completed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    wordwall_url?: string
                    wordwall_id?: string | null
                    template_type?: string
                    status?: string
                    error_message?: string | null
                    h5p_package_url?: string | null
                    latency_ms?: number | null
                    created_at?: string
                    completed_at?: string | null
                }
            }
        }
    }
}
