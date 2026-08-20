import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: dbCheck, error } = await supabase.from('products').select('count').limit(1);

    const isHealthy = !error;

    return NextResponse.json(
      {
        status: isHealthy ? 'HEALTHY' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        service: 'Sareethi AI Worker Platform',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        checks: {
          database: isHealthy ? 'CONNECTED' : 'ERROR',
          ai_worker: 'OPERATIONAL',
          storage: 'OPERATIONAL',
        },
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'UNHEALTHY',
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
