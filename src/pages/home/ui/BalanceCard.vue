<script setup lang="ts">
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue';
import { TriangleAlertIcon } from 'lucide-vue-next';

import { useCurrentWallet } from '~/entities/wallet';

const wallet = useCurrentWallet();
</script>

<template>
  <section class="card">
    <div class="card__header">
      <h2 class="card__title">Your balance</h2>
    </div>
    <span class="card__text-line">
      <TooltipProvider>
        <TooltipRoot class="tooltip" :delay-duration="0">
          <TooltipTrigger role="alert" aria-label="Balance alert">
            <TriangleAlertIcon
              v-if="wallet.totalBalance < 0"
              role="img"
              aria-hidden="true"
              class="card__alert-icon"
            />
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent class="warning-tooltip tooltip__content">
              <TooltipArrow class="tooltip__arrow" />
              Heads up! Your spending in this account has exceeded the available
              balance.
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
      </TooltipProvider>
      <p>{{ wallet.formattedTotalBalance }}</p>
    </span>
  </section>
</template>

<style lang="scss">
@use '@globals/tools' as t;

.warning-tooltip {
  width: t.px-to-rem(250px);
}
.card__text-line {
  display: flex;
  align-items: flex-start;
}
.card__alert-icon {
  color: var(t.get-color-var('danger'));
}
</style>
