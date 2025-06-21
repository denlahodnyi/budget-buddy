<script setup lang="ts">
import { useCurrentWallet } from '~/entities/wallet';

const wallet = useCurrentWallet();
</script>

<template>
  <section class="card">
    <div class="card__header">
      <h2 class="card__title">Your balance</h2>
    </div>
    <p>{{ wallet.formattedTotalBalance }}</p>
  </section>
</template>
