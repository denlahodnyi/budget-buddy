<script setup lang="ts">
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'radix-vue';

import { deleteUser } from '../model';

export interface UserDelAlertProps {
  userId: string;
}

const { userId } = defineProps<UserDelAlertProps>();

const handleDeleteUser = () => {
  deleteUser(userId);
};
</script>

<template>
  <AlertDialogRoot>
    <AlertDialogTrigger as-child>
      <slot></slot>
    </AlertDialogTrigger>
    <AlertDialogPortal>
      <AlertDialogOverlay class="dialog__overlay" />
      <AlertDialogContent class="dialog__content">
        <AlertDialogTitle class="dialog__title">
          Are you absolutely sure?
        </AlertDialogTitle>
        <AlertDialogDescription class="dialog__description">
          This action cannot be undone. This will permanently delete your user
          and all related data (wallets, transactions, etc).
        </AlertDialogDescription>
        <div
          :style="{ display: 'flex', gap: '25px', justifyContent: 'flex-end' }"
        >
          <AlertDialogCancel class="btn" data-variant="outline">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            class="btn"
            data-variant="destructive"
            @click="handleDeleteUser"
          >
            Yes, delete user
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
