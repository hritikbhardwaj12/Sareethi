'use server';

import { festivalWorker } from '@/lib/ai/festival-worker';
import { tool_get_upcoming_festivals } from '@/lib/ai/festival-tools';
import { revalidatePath } from 'next/cache';

export async function getUpcomingFestivalsAction(today?: string) {
  return await tool_get_upcoming_festivals({ today: today || '2026-10-15' });
}

export async function runFestivalWorkerAction(options: {
  today?: string;
  forceFailureDemo?: boolean;
}) {
  const result = await festivalWorker.runFestivalWorkflow({
    today: options.today || '2026-10-15',
    forceFailureDemo: options.forceFailureDemo || false,
  });

  revalidatePath('/admin/festivals');
  revalidatePath('/admin/approvals');
  revalidatePath('/admin/dashboard');

  return result;
}
