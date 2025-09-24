import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';

import type { CreatedUser, CreatedUserErrors } from '~/entities/user';
import { createUser, editUser } from '../model';

type UseUserForm = {
  defaultValues?: MaybeRefOrGetter<{
    name: string;
  }>;
} & (
  | { isEdit: MaybeRefOrGetter<true>; userId: MaybeRefOrGetter<string> }
  | { isEdit: MaybeRefOrGetter<false> }
);

export function useUserForm(props: UseUserForm) {
  const { defaultValues } = props;
  const formState = ref<{ name: string }>({
    name: defaultValues ? toValue(defaultValues).name : '',
  });
  const formErrors = ref<CreatedUserErrors>({});
  const isDirty = computed(
    () => (toValue(defaultValues)?.name || '') !== formState.value.name
  );

  watch(
    () => toValue(defaultValues),
    (newDefVal) => {
      formState.value.name = newDefVal?.name ?? '';
    }
  );

  const submit = () => {
    const { name } = formState.value;
    const payload: CreatedUser = { name };
    const result = toValue(props.isEdit)
      ? editUser(
          toValue(
            (props as Exclude<UseUserForm, { isEdit: MaybeRefOrGetter<false> }>)
              .userId
          ),
          payload
        )
      : createUser(payload);

    if (result.errors) {
      formErrors.value = result.errors;
    } else {
      formErrors.value = {};
      formState.value = { name: toValue(defaultValues)?.name ?? '' };
    }

    return result;
  };

  return { formState, formErrors, submit, isDirty };
}
