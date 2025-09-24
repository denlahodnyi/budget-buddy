<script setup lang="ts">
import { CircleUserRoundIcon, DotIcon, PlusIcon, XIcon } from 'lucide-vue-next';
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'radix-vue';
import { computed, ref } from 'vue';

import { useCurrentUser, useCurrentUserId, useUsers } from '~/entities/user';
import { UserForm, useUserForm } from '~/features/user/create-and-edit';
import { switchUser } from '~/features/user/switch-user';

const { mountTo = 'body' } = defineProps<{
  mountTo?: HTMLElement | string;
}>();

const users = useUsers();
const currentUserId = useCurrentUserId();
const currentUser = useCurrentUser();
const canAddUser = computed(() => Object.keys(users.value).length < 3);
const { formState, formErrors, submit } = useUserForm({ isEdit: false });
const isDialogOpen = ref(false);

const handleDialogOpenChange = (open: boolean) => {
  isDialogOpen.value = open;
};

const handleSaveNewUser = () => {
  const { success } = submit();
  if (success) isDialogOpen.value = false;
};
</script>

<template>
  <DropdownMenuRoot class="user-selector">
    <DropdownMenuTrigger as-child>
      <button
        class="btn user-selector__trigger"
        data-variant="outline"
        aria-label="Switch or create user"
      >
        {{ currentUser.name }}
        <CircleUserRoundIcon />
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuPortal :to="mountTo">
      <DropdownMenuContent
        class="dropdown__content user-selector__modal-content"
      >
        <DropdownMenuRadioGroup
          :model-value="currentUserId"
          @update:model-value="(userId) => switchUser(userId)"
        >
          <template v-for="(user, id) in users" :key="id">
            <DropdownMenuRadioItem class="dropdown__item" :value="id">
              <DropdownMenuItemIndicator class="dropdown__menu-item-indicator">
                <DotIcon :size="16" />
              </DropdownMenuItemIndicator>
              {{ user.name }}
            </DropdownMenuRadioItem>
          </template>
        </DropdownMenuRadioGroup>

        <template v-if="canAddUser">
          <DropdownMenuSeparator class="dropdown__separator" />
          <DialogRoot
            class="dialog"
            :open="isDialogOpen"
            @update:open="handleDialogOpenChange"
          >
            <DialogTrigger as-child>
              <button
                class="btn user-selector__create-trigger"
                data-variant="ghost"
              >
                <PlusIcon :size="16" />
                Add new user
              </button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay class="dialog__overlay" />
              <DialogContent class="dialog__content" aria-describedby="">
                <div class="dialog__header">
                  <DialogTitle class="dialog__title"
                    >Create new user</DialogTitle
                  >
                  <DialogClose
                    class="dialog__close btn"
                    data-variant="ghost"
                    data-size="icon"
                    aria-label="Close dialog"
                  >
                    <XIcon :size="16" />
                  </DialogClose>
                </div>
                <UserForm
                  v-model:name="formState.name"
                  :form-errors="formErrors"
                  @submit.prevent="handleSaveNewUser"
                >
                  <template #actions>
                    <div class="form__footer">
                      <button type="submit" class="btn">Save</button>
                      <DialogClose as-child>
                        <button class="btn" data-variant="outline">
                          Cancel
                        </button>
                      </DialogClose>
                    </div>
                  </template>
                </UserForm>
              </DialogContent>
            </DialogPortal>
          </DialogRoot>
        </template>

        <DropdownMenuArrow class="dropdown__arrow" />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.user-selector__trigger {
  block-size: auto;
  padding-block: 6px;
  gap: 16px;
  font-size: t.px-to-rem(18px);
}
:deep(.user-selector__modal-content) {
  min-inline-size: t.px-to-rem(160px);
}
.user-selector__create-trigger {
  inline-size: 100%;
}
</style>
