<template>
  <div
    :class="$style.box"
    ref="container"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @scroll="handleScroll"
  >
    <div
      v-for="item in list"
      :key="item"
      :data-item="item"
    >
      <slot :item="item" :isActive="!!selectedMap[item]"></slot>
    </div>
    <div
      v-if="selectionRect"
      :class="$style.selectionRect"
      :style="{
        left: selectionRect.x + 'px',
        top: selectionRect.y + 'px',
        width: selectionRect.width + 'px',
        height: selectionRect.height + 'px',
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from "vue";
import { DOMVector } from "@/data/DOMVector";
import { isIntersecting, clamp } from "@/utils";

defineProps<{
  list: any[];
}>();

const emits = defineEmits<{
  (e: 'selected', selectedMap: Record<string, boolean>): void
}>();

const isDragging = ref(false);

const container = ref<HTMLElement | null>(null);

const selectedMap = ref<Record<string, boolean>>({});

watch(
  () => selectedMap.value,
  () => {
    emits('selected', selectedMap.value);
  }
);

const dragVector = ref<DOMVector | null>(null);

const scrollVector = ref<DOMVector | null>(null);

let handler: number | undefined;

const containerScrollRect = computed(() => {
  if (!container.value) return null;
  return [container.value.scrollWidth, container.value.scrollHeight];
});

const selectionRect = computed(() => {
  if (
    !isDragging.value ||
    !scrollVector.value ||
    !dragVector.value ||
    !containerScrollRect.value
  )
    return null;

  return dragVector.value
    .add(scrollVector.value)
    .clamp(
      new DOMRect(
        5,
        5,
        containerScrollRect.value[0] - 5,
        containerScrollRect.value[1] - 5
      )
    )
    .toDOMRect();
});

const updateSelection = () => {
  if (!container.value || !selectionRect.value) return;
  const map = {} as Record<string, boolean>;
  const containerRect = container.value?.getBoundingClientRect();
  container.value?.querySelectorAll("[data-item]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const item = el.getAttribute("data-item");
    const itemRect = el.getBoundingClientRect();
    const x = itemRect.x - containerRect.x + container.value!.scrollLeft;
    const y = itemRect.y - containerRect.y + container.value!.scrollTop;

    const translatedItemRect = new DOMRect(
      x,
      y,
      itemRect.width,
      itemRect.height
    );
    if (!isIntersecting(selectionRect.value!, translatedItemRect)) return;

    if (item) {
      map[item as string] = true;
    }
  });
  selectedMap.value = map;
};

const checkShouldAutoScroll = () => {
  if (!container.value || !dragVector.value) {
    return;
  }

  const point = dragVector.value.getPoint();
  const containerRect = container.value.getBoundingClientRect();

  const shouldScrollRight = containerRect.width - point.x < 20;
  const shouldScrollLeft = point.x < 20;
  const shouldScrollDown = containerRect.height - point.y < 20;
  const shouldScrollUp = point.y < 20;

  const left = shouldScrollRight
    ? clamp(20 - containerRect.width + point.x, 0, 15)
    : shouldScrollLeft
    ? -1 * clamp(20 - point.x, 0, 15)
    : undefined;

  const top = shouldScrollDown
    ? clamp(20 - containerRect.height + point.y, 0, 15)
    : shouldScrollUp
    ? -1 * clamp(20 - point.y, 0, 15)
    : undefined;

  if (left === undefined && top === undefined) {
    handler = requestAnimationFrame(checkShouldAutoScroll);
    return;
  };

  container.value.scrollBy({
    left,
    top,
  });
  handler = requestAnimationFrame(checkShouldAutoScroll);
};

const handlePointerDown = (e: PointerEvent) => {
  if (e.button !== 0) return;
  const containerRect = (e.currentTarget as any).getBoundingClientRect();
  const { scrollLeft, scrollTop } = e.currentTarget as any;

  dragVector.value = new DOMVector(
    e.clientX - containerRect.x,
    e.clientY - containerRect.y,
    0,
    0
  );
  scrollVector.value = new DOMVector(scrollLeft, scrollTop, 0, 0);
  (e.currentTarget as any).setPointerCapture(e.pointerId);
};

const MOVE_THRESHOLD = 10;

const handlePointerMove = (e: PointerEvent) => {
  if (!dragVector.value || !scrollVector.value) return;
  const currentRect = dragVector.value;
  const containerRect = (e.currentTarget as any).getBoundingClientRect();

  const x = e.clientX - containerRect.x;
  const y = e.clientY - containerRect.y;

  const nextVector = new DOMVector(
    currentRect.x,
    currentRect.y,
    x - currentRect.x,
    y - currentRect.y
  );

  if (!isDragging.value && nextVector.getDistance() <= MOVE_THRESHOLD) return;

  isDragging.value = true;
  dragVector.value = nextVector;
  updateSelection();

  if (handler)
    cancelAnimationFrame(handler);

  handler = requestAnimationFrame(checkShouldAutoScroll);
};

const handlePointerUp = () => {
  dragVector.value = null;
  scrollVector.value = null;
  if (!isDragging.value) {
    selectedMap.value = {};
    return;
  }
  isDragging.value = false;
};

const handleScroll = (e: Event) => {
  if (!dragVector.value || !scrollVector.value) return;

  const { scrollLeft, scrollTop } = e.currentTarget as any;

  const nextScrollVector = new DOMVector(
    scrollVector.value.x,
    scrollVector.value.y,
    scrollLeft - scrollVector.value.x,
    scrollTop - scrollVector.value.y
  );

  scrollVector.value = nextScrollVector;
  updateSelection();
};

onUnmounted(() => {
  if (handler) cancelAnimationFrame(handler);
});
</script>

<style lang="less" module>
.box {
  width: 600px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  border: 1px solid;
  padding: 20px;
  position: relative;
  user-select: none;
  max-height: 200px;
  overflow: auto;

  .selectionRect {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.6);
    border: 2px solid;
  }
}
</style>
