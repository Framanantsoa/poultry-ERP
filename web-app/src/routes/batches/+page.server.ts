import { listBatches, type BatchListItem } from '#lib/server/db/queries/batches.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url })
 : Promise<{ batches: BatchListItem[]; status: string }> => {
	const statusParam = url.searchParams.get('status');
	const status =
		statusParam === 'active' || statusParam === 'completed' || statusParam === 'archived'
			? statusParam
			: undefined;

	return {
		batches: await listBatches({ status }),
		status: status ?? 'all'
	};
};

export const actions: Actions = { };
