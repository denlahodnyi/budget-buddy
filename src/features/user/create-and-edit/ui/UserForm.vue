<script lang="ts" setup>
import { Label } from 'radix-vue';
import { useId } from 'vue';

import type { CreatedUserErrors } from '~/entities/user';
import { FormMessage } from '~/shared/ui/form';

export interface UserFormProps {
  formErrors: CreatedUserErrors;
}

const { formErrors } = defineProps<UserFormProps>();
const nameValue = defineModel<string>('name');

const id = useId();
</script>

<template>
  <form class="form">
    <div class="form-item">
      <Label :for="id">Name</Label>
      <input
        :id="id"
        v-model="nameValue"
        type="text"
        aria-describedby="user-name-error"
        class="input"
      />
      <FormMessage id="user-name-error" variant="error">
        {{ formErrors.name }}
      </FormMessage>
    </div>
    <slot name="actions" />
  </form>
</template>
