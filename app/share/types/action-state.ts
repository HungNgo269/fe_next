export type FormActionState = {
  success: boolean;
  error: string | null;
};

export const IDLE_FORM_ACTION_STATE: FormActionState = {
  success: false,
  error: null,
};
