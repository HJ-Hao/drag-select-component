<template>
  <div :class="$style.container">
    <div>selectNum: {{ count }}</div>
    <DragToSelect :list="list" @selected="handleSelected">
      <template #default="{ item, isActive }">
        <div :class="[isActive ? $style.activeItem : $style.item]">{{ item }}</div>
      </template>
    </DragToSelect>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import DragToSelect from './components/DragToSelect.vue';
const list = ref(Array.from({ length: 60 }).map((_, i) => i + 1));
const selectedMap = ref<Record<string, boolean>>({});

const count = computed(() => Object.keys(selectedMap.value).length || 0);

const handleSelected = (val: Record<string, boolean>) => {
  selectedMap.value = val;
};
</script>

<style lang="less" module>
.container {
  height: 100vh;
  width: 100%;

  .item, .activeItem {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    width: 50px;
  }

  .item {
    color: #333;
    background-color: #eee;
  }

  .activeItem {
    background-color: #333;
    color: #eee;
  }
}
</style>
