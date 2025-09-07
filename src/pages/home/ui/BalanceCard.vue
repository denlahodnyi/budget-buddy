<script setup lang="ts">
import { TriangleAlertIcon } from 'lucide-vue-next';
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue';

import { useCurrentUserId } from '~/entities/user';
import { useUserBalance } from '~/entities/wallet';
import MainCardValue from './MainCardValue.vue';

const userId = useCurrentUserId();
const totalBalance = useUserBalance(userId);
</script>

<template>
  <section class="card balance-card">
    <div class="card__header">
      <h2 class="card__title">My balance</h2>
    </div>
    <span class="card__text-line">
      <TooltipProvider>
        <TooltipRoot class="tooltip warning-tooltip" :delay-duration="0">
          <TooltipTrigger
            v-if="totalBalance.balance < 0"
            role="alert"
            aria-label="Balance alert"
          >
            <TriangleAlertIcon
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
      <MainCardValue>
        {{ totalBalance.formattedBalance }}
      </MainCardValue>
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
