<script setup lang="ts">
import { DatePicker } from 'primevue';
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from 'lucide-vue-next';
</script>

<template>
  <DatePicker
    show-time
    show-button-bar
    hour-format="24"
    class="datepicker"
    panel-class="calendar-popover"
    input-class="datepicker__input input"
    show-icon
    icon-display="input"
    append-to="self"
    :navigator-button-props="{
      class: 'btn calendar__nav-btn',
      'data-variant': 'ghost',
    }"
    :timepicker-button-props="{
      class: 'btn calendar__nav-btn',
      'data-variant': 'ghost',
    }"
    :clear-button-props="{ class: 'btn', 'data-variant': 'ghost' }"
    :today-button-props="{ class: 'btn', 'data-variant': 'ghost' }"
    :pt="{
      inputIconContainer: {
        class: 'datepicker__icon-wrapper',
      },
      calendarContainer: { class: 'calendar-container' },
      calendar: { class: 'calendar' },
      header: { class: 'calendar__header' },
      title: { class: 'calendar__title' },
      selectMonth: { class: 'calendar__month' },
      selectYear: { class: 'calendar__year' },
      dayView: { class: 'calendar__day-view' },
      tableHeader: { class: 'calendar__table-header' },
      tableHeaderCell: { class: 'calendar__table-header-cell' },
      weekDay: { class: 'calendar__weekday' },
      tableBody: { class: 'calendar__table-body' },
      tableBodyRow: { class: 'calendar__table-body-row' },
      dayCell: { class: 'calendar__day-cell' },
      day: { class: 'calendar__day' },
      monthView: { class: 'calendar__month-view' },
      month: { class: 'calendar__month' },
      yearView: { class: 'calendar__year-view' },
      year: { class: 'calendar__year' },
      timePicker: { class: 'calendar__time-picker' },
      hourPicker: { class: 'calendar__hour-picker' },
      minutePicker: { class: 'calendar__minute-picker' },
      buttonbar: { class: 'calendar__footer' },
      pcClearButton: {},
    }"
  >
    <template #inputicon="slotProps">
      <CalendarDaysIcon
        class="datepicker__icon"
        @click="slotProps.clickCallback"
      />
    </template>
    <template #previcon>
      <ChevronLeftIcon :size="16" />
    </template>
    <template #nexticon>
      <ChevronRightIcon :size="16" />
    </template>
    <template #incrementicon>
      <ChevronUpIcon :size="16" />
    </template>
    <template #decrementicon>
      <ChevronDownIcon :size="16" />
    </template>
  </DatePicker>
</template>

<style src="./datepicker.scss"></style>
