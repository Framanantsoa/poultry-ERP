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