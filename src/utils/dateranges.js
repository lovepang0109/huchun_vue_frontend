import { endOfMonth, startOfMonth, subMonths, subDays, startOfYear, endOfYear, subYears} from 'date-fns';

const dayRanges = ref([
{ label: 'Today', value: [new Date(), new Date()] },
{ label: 'Yesterday', value: [subDays(new Date(), 1), subDays(new Date(), 1)] },
{ label: 'Last 7 days', value: [subDays(new Date(), 6), new Date()] },
{ label: 'Last 15 days', value: [subDays(new Date(), 14), new Date()] },
{ label: 'Last 30 days', value: [subDays(new Date(), 29), new Date()] },
{ label: 'This month', value: [startOfMonth(new Date()), new Date()] },
{ label: 'Last month', value: [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))] },
]);

const monthRanges = ref([
  { label: 'This month', value: [startOfMonth(new Date()), endOfMonth(new Date())] },
  { label: 'Last month', value: [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))] },
  { label: 'Last 3 months', value: [startOfMonth(subMonths(new Date(), 2)), endOfMonth(new Date())] },
  { label: 'This year', value: [startOfYear(new Date()), endOfYear(new Date())] },
  { label: 'Last year', value: [startOfYear(subYears(new Date(), 1)), endOfYear(subYears(new Date(), 1))] },
  ]);

  
  export default {
    dayRanges: dayRanges,
    monthRanges: monthRanges,
    dayFormat: 'dd/MM/yyyy',
    monthFormat: 'MM/yyyy'
  }
  