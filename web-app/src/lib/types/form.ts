export type FormResult<TValues = Record<string, unknown>> = {
	values?: TValues;
	errors?: Partial<Record<keyof TValues | string, string[]>>;
	message?: string;
	success?: boolean;
};

export type BatchFormResult = {
	errors?: {
		code?: string[];
		name?: string[];
		breedId?: string[];
		initialCount?: string[];
		currentCount?: string[];
		arrivalDate?: string[];
		endDate?: string[];
		status?: string[];
		notes?: string[];
	};
	values?: Record<string, FormDataEntryValue | number | null | undefined>;
	message?: string;
};

export type EggProductionFormResult = FormResult<{
	batchId?: number | string | null;
	productionDate?: string | null;
	eggsCollected?: number | string | null;
	eggsBroken?: number | string | null;
	eggsDiscarded?: number | string | null;
	totalWeightKg?: number | string | null;
	notes?: string | null;
}>;