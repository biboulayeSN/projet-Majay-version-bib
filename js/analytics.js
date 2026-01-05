import { supabase } from "./config.js";
import { authMajay } from "./auth.js";

/**
 * Obtenir les analytics d'un produit
 */
export async function getProductAnalytics(productId, dateRange = {}) {
    try {
        const session = authMajay.getSession();
        if (!session || !session.store_id) {
            throw new Error('Non authentifié');
        }

        let query = supabase
            .from('product_analytics')
            .select('*')
            .eq('store_id', session.store_id)
            .eq('product_id', productId)
            .order('date', { ascending: false });

        if (dateRange.start) {
            query = query.gte('date', dateRange.start);
        }
        if (dateRange.end) {
            query = query.lte('date', dateRange.end);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Obtenir les statistiques régionales
 */
export async function getRegionalStats(dateRange = {}) {
    try {
        const session = authMajay.getSession();
        if (!session || !session.store_id) {
            throw new Error('Non authentifié');
        }

        let query = supabase
            .from('regional_stats')
            .select('*')
            .eq('store_id', session.store_id)
            .order('total_revenue', { ascending: false });

        if (dateRange.start) {
            query = query.gte('date', dateRange.start);
        }
        if (dateRange.end) {
            query = query.lte('date', dateRange.end);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Obtenir les données de tendances
 */
export async function getTrendData(category = null) {
    try {
        const session = authMajay.getSession();
        if (!session || !session.store_id) {
            throw new Error('Non authentifié');
        }

        // Récupérer les produits de la boutique
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id')
            .eq('store_id', session.store_id)
            .eq('is_active', true);

        if (productsError) throw productsError;

        const productIds = products.map(p => p.id);

        if (productIds.length === 0) {
            return { success: true, data: [] };
        }

        let query = supabase
            .from('trend_data')
            .select('*')
            .in('product_id', productIds)
            .eq('snapshot_date', new Date().toISOString().split('T')[0])
            .order('rank_globally', { ascending: true })
            .limit(100);

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Obtenir les statistiques globales de la boutique
 */
export async function getStoreStats(dateRange = {}) {
    try {
        const session = authMajay.getSession();
        if (!session || !session.store_id) {
            throw new Error('Non authentifié');
        }

        // Commandes
        let ordersQuery = supabase
            .from('orders')
            .select('total, status, created_at')
            .eq('store_id', session.store_id);

        if (dateRange.start) {
            ordersQuery = ordersQuery.gte('created_at', dateRange.start);
        }
        if (dateRange.end) {
            ordersQuery = ordersQuery.lte('created_at', dateRange.end);
        }

        const { data: orders, error: ordersError } = await ordersQuery;

        if (ordersError) throw ordersError;

        // Produits
        const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('store_id', session.store_id)
            .eq('is_active', true);

        // Clics
        let clicksQuery = supabase
            .from('click_events')
            .select('event_type', { count: 'exact', head: false })
            .eq('store_id', session.store_id);

        if (dateRange.start) {
            clicksQuery = clicksQuery.gte('created_at', dateRange.start);
        }
        if (dateRange.end) {
            clicksQuery = clicksQuery.lte('created_at', dateRange.end);
        }

        const { data: clicks, error: clicksError } = await clicksQuery;

        const stats = {
            total_orders: orders?.length || 0,
            total_revenue: orders?.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (parseInt(o.total) || 0), 0) || 0,
            total_products: productsCount || 0,
            total_views: clicks?.filter(c => c.event_type === 'view').length || 0,
            total_cart_adds: clicks?.filter(c => c.event_type === 'cart_add').length || 0,
            total_purchases: clicks?.filter(c => c.event_type === 'purchase').length || 0
        };

        return { success: true, data: stats };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export const analyticsUtils = {
    getProductAnalytics,
    getRegionalStats,
    getTrendData,
    getStoreStats
};

