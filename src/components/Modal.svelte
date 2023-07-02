<script>
  import { createEventDispatcher } from 'svelte'
  import { cubicInOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition'
  export let open = false
  export let title = ''
  const dispatch = createEventDispatcher()
</script>

{#if open}
<div in:fade={{ duration: 180, easing: cubicInOut }} out:fade={{ duration: 100 }} class="modal z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0" role="dialog" >
    <div class="modal-overlay fixed w-full h-full bg-gray-900 opacity-50"></div>
    <div class="bg-white lg:h-max mx-auto rounded-lg shadow-xl z-50 overflow-y-auto">
      <div class="flex justify-between items-center head bg-gray-100 py-2 px-5 text-normal font-medium">
        {title}
        <button class="p-1 bg-gray-300 hover:bg-gray-300 rounded-full ml-4" on:click={() => dispatch('close')}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
        </button>
      </div>
      <div class="content p-5">
        <slot name="body" />
      </div>
    </div>
  </div>
{/if}
