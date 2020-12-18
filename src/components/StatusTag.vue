<template>
<span class="status-tag tag" :class="classes[status]">
  {{ status }}
</span>
</template>

<script>
export default {
  name: 'status-tag',
  props: {
    status: String,
  },
  data() {
    return {
      classes: {
        disabled: 'is-light',
        draft: 'is-info',
        complete: 'is-primary',
      },
    };
  },
};
</script>
