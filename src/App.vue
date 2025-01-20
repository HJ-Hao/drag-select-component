<template>
  <div :class="$style.container">
    <DragToSelect />
  </div>
</template>

<script setup lang="ts">
import DragToSelect from './components/DragToSelect.vue';
</script>

<style module>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
}
</style>
