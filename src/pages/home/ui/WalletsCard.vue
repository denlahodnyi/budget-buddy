<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next';

import { useCurrentUserId } from '~/entities/user';
import { useUserWalletsIds } from '~/entities/wallet';
import WalletDialog from './WalletDialog.vue';
import WalletItem from './WalletItem.vue';

const userId = useCurrentUserId();
const { ids: walletsIds } = useUserWalletsIds(userId);
</script>

<template>
  <section class="card">
    <div class="card__header card__header_with-actions">
      <h2 class="card__title">My wallets</h2>
      <WalletDialog>
        <button
          class="btn"
          data-variant="outline"
          data-size="icon"
          aria-label="Add new wallet"
        >
          <PlusIcon :size="16" />
        </button>
      </WalletDialog>
    </div>
    <div role="list" class="wallets-list">
      <WalletItem
        v-for="id of walletsIds"
        :key="id"
        :wallet-id="id"
        role="listitem"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.wallets-list {
  overflow: auto;
}
</style>
