<script setup lang="ts">
import { ref } from 'vue';

const state = ref<'sun' | 'moon'>('sun');

function toggleState() {
    state.value = state.value === 'sun' ? 'moon' : 'sun';
}
</script>

<template>
    <div @click="toggleState">
        <span v-if="state === 'sun'">🌞</span>
        <span v-if="state === 'moon'">🌚</span>
    </div>
</template>
