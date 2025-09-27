<script setup lang="ts">
import { PlusIcon, WalletIcon } from 'lucide-vue-next';

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
      <h2 class="card__title card__title--with-icon">
        <WalletIcon :size="30" aria-hidden />
        <span>My wallets</span>
      </h2>
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
        v-for="(id, i) of walletsIds"
        :key="id"
        :wallet-id="id"
        :data-testid="`wallet-${i}`"
        role="listitem"
        class="wallets-list__item"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.wallets-list {
  overflow: auto;
}
.wallets-list__item {
  padding-block: 10px;
  &:not(:first-child) {
    border-block-start: 1px solid var(t.get-color-var('border'));
  }
}
</style>
