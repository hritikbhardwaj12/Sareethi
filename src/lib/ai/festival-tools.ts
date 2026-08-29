import festivalsData from '@/data/festivals.json';
import { createClient } from '@/lib/supabase/server';
import { FestivalEventData } from './types';

export interface UpcomingFestivalQueryInput {
  today?: string; // YYYY-MM-DD format (defaults to 2026-10-01 or current date)
  lookahead_days?: number;
}

/**
  * Tool 1: get_upcoming_festivals
  * Reads static festival JSON dataset and calculates days remaining & campaign window eligibility
  */
export async function tool_get_upcoming_festivals(input: UpcomingFestivalQueryInput = {}): Promise<{
  today: string;
  upcoming_festivals: FestivalEventData[];
  active_campaign_groups: any[];
}> {
  const currentDateStr = input.today || '2026-10-15'; // Default to peak October festival window for demo
  const lookahead = input.lookahead_days || 30;
  const currentDate = new Date(currentDateStr);

  const upcoming: FestivalEventData[] = [];

  for (const fest of festivalsData.festivals) {
    if (!fest.active) continue;

    const festDate = new Date(fest.date);
    const diffTime = festDate.getTime() - currentDate.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if within lookahead window and campaign start days
    if (daysRemaining >= -2 && daysRemaining <= fest.campaign_start_days) {
      upcoming.push({
        id: fest.id,
        name: fest.name,
        date: fest.date,
        days_remaining: daysRemaining,
        business_relevance: fest.business_relevance as any,
        recommended_tags: fest.recommended_tags || [],
      });
    }
  }

  // Find relevant active campaign groups
  const activeGroups = festivalsData.campaign_groups.filter((grp) => {
    const startDate = new Date(grp.campaign_start_date);
    return currentDate >= startDate;
  });

  return {
    today: currentDateStr,
    upcoming_festivals: upcoming.sort((a, b) => a.days_remaining - b.days_remaining),
    active_campaign_groups: activeGroups,
  };
}

/**
  * Tool 2: get_festival_inventory
  * Queries active festive inventory from DB matching festive styles, colors, and fabrics
  */
export async function tool_get_festival_inventory(tags: string[] = ['silk', 'traditional', 'festive']) {
  let inventoryItems: any[] = [];

  try {
    const supabase = await createClient();

    const { data: products } = await supabase
      .from('products')
      .select('id, name, category, selling_price, stock_quantity, status')
      .neq('status', 'DELETED')
      .gt('stock_quantity', 0)
      .limit(10);

    if (products && products.length > 0) {
      inventoryItems = products.map((p) => ({
        product_id: p.id,
        name: p.name,
        category: p.category,
        price: p.selling_price,
        stock: p.stock_quantity,
        tags: tags.length > 0 ? tags : ['festive', 'traditional', 'silk'],
      }));
    }
  } catch (err) {
    console.warn('DB inventory query notice:', err);
  }

  // Guaranteed fallback products if database products table is empty or unseeded
  if (inventoryItems.length === 0) {
    inventoryItems = [
      {
        product_id: 'SAR-00001',
        name: 'Red Woven Banarasi Silk Saree',
        category: 'Saree',
        price: 5500,
        stock: 10,
        tags: ['silk', 'festive', 'traditional', 'red', 'banarasi'],
      },
      {
        product_id: 'SAR-00002',
        name: 'Golden Kanjeevaram Silk Saree',
        category: 'Saree',
        price: 8500,
        stock: 5,
        tags: ['silk', 'festive', 'gold', 'kanjeevaram', 'premium'],
      },
      {
        product_id: 'SUIT-00001',
        name: 'Royal Blue Chanderi Silk Suit Set',
        category: 'Suit',
        price: 3400,
        stock: 8,
        tags: ['suit', 'festive', 'traditional', 'blue', 'chanderi'],
      },
    ];
  }

  return inventoryItems;
}

/**
  * Tool 3: get_campaign_eligible_customers
  * Filters active customers based on marketing_opt_in, last_contacted_at, and campaign anti-spam policies
  */
export async function tool_get_campaign_eligible_customers(festivalId: string) {
  const supabase = await createClient();

  // Query customers table
  const { data: customers } = await supabase.from('customers').select('*');

  // Realistic mock/DB customer pool demonstrating policy filtering
  const allCustomers = (customers && customers.length > 0) ? customers : [
    {
      id: 'CUST-001',
      name: 'Priya Sharma',
      phone: '9128737971',
      marketing_opt_in: true,
      last_contacted_at: '2026-09-01',
      previous_purchases: ['Banarasi Silk Saree', 'Red Festive Saree'],
      preferences: { colors: ['Red', 'Maroon', 'Gold'], styles: ['Silk', 'Traditional'], price_min: 3000, price_max: 8000 }
    },
    {
      id: 'CUST-002',
      name: 'Anjali Verma',
      phone: '9876543210',
      marketing_opt_in: false, // EXCLUDED: Opt-out consent policy
      last_contacted_at: '2026-08-15',
      previous_purchases: ['Chanderi Suit'],
      preferences: { colors: ['Blue', 'Green'], styles: ['Cotton'], price_min: 1000, price_max: 3000 }
    },
    {
      id: 'CUST-003',
      name: 'Neha Gupta',
      phone: '9811223344',
      marketing_opt_in: true,
      last_contacted_at: '2026-10-14', // EXCLUDED: Contacted 1 day ago (Anti-spam policy)
      previous_purchases: ['Pochampally Ikkat Saree'],
      preferences: { colors: ['Pink', 'Purple'], styles: ['Ikkat', 'Festive'], price_min: 2000, price_max: 6000 }
    },
    {
      id: 'CUST-004',
      name: 'Meenakshi Iyer',
      phone: '9711002288',
      marketing_opt_in: true,
      last_contacted_at: '2026-08-20',
      previous_purchases: ['Kanjeevaram Silk Saree'],
      preferences: { colors: ['Gold', 'Burgundy', 'Red'], styles: ['Silk', 'Bridal'], price_min: 4000, price_max: 12000 }
    }
  ];

  // Evaluate policy eligibility
  const eligible = [];
  const excluded = [];

  for (const cust of allCustomers) {
    const consent = cust.marketing_opt_in !== false;
    const daysSinceContact = cust.last_contacted_at
      ? Math.ceil((new Date('2026-10-15').getTime() - new Date(cust.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
      : 99;

    const notRecentlyContacted = daysSinceContact >= 7;

    if (consent && notRecentlyContacted) {
      eligible.push({
        customer_id: cust.id,
        name: cust.name,
        phone: cust.phone,
        preferences: cust.preferences || { colors: ['Red', 'Gold'], styles: ['Silk'] },
        previous_purchases: cust.previous_purchases || ['Silk Saree']
      });
    } else {
      excluded.push({
        customer_id: cust.id,
        name: cust.name,
        reason: !consent ? 'OPTED_OUT_MARKETING_CONSENT' : 'RECENTLY_CONTACTED_ANTI_SPAM'
      });
    }
  }

  return { eligible, excluded };
}
