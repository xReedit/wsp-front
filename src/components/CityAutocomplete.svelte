<script lang="ts">
    import { searchUbigeo, formatUbigeoForSave, type UbigeoItem } from '$lib/ubigeo-peru';
    import { createEventDispatcher } from 'svelte';

    export let ciudades: string = '';

    const dispatch = createEventDispatcher();

    let searchQuery = '';
    let suggestions: UbigeoItem[] = [];
    let showSuggestions = false;
    let selectedTags: { label: string; value: string }[] = [];
    let inputEl: HTMLInputElement;
    let highlightedIndex = -1;

    // Parsear las ciudades existentes al montar
    $: {
        if (ciudades && selectedTags.length === 0) {
            selectedTags = ciudades
                .split(',')
                .map(c => c.trim())
                .filter(c => c.length > 0)
                .map(c => ({ label: c, value: c }));
        }
    }

    function onInput() {
        highlightedIndex = -1;
        if (searchQuery.trim().length >= 2) {
            suggestions = searchUbigeo(searchQuery, 8);
            showSuggestions = suggestions.length > 0;
        } else {
            suggestions = [];
            showSuggestions = false;
        }
    }

    function selectSuggestion(item: UbigeoItem) {
        const formatted = formatUbigeoForSave(item);
        
        // Evitar duplicados
        if (selectedTags.some(t => t.value === formatted)) {
            searchQuery = '';
            showSuggestions = false;
            return;
        }

        selectedTags = [...selectedTags, { label: item.label, value: formatted }];
        searchQuery = '';
        showSuggestions = false;
        suggestions = [];
        highlightedIndex = -1;
        updateCiudades();
        inputEl?.focus();
    }

    function removeTag(index: number) {
        selectedTags = selectedTags.filter((_, i) => i !== index);
        updateCiudades();
    }

    function updateCiudades() {
        ciudades = selectedTags.map(t => t.value).join(', ');
        dispatch('change', ciudades);
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (highlightedIndex < suggestions.length - 1) {
                highlightedIndex++;
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (highlightedIndex > 0) {
                highlightedIndex--;
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                selectSuggestion(suggestions[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            showSuggestions = false;
            highlightedIndex = -1;
        } else if (e.key === 'Backspace' && searchQuery === '' && selectedTags.length > 0) {
            removeTag(selectedTags.length - 1);
        }
    }

    function onBlur() {
        // Delay para permitir click en sugerencias
        setTimeout(() => {
            showSuggestions = false;
            highlightedIndex = -1;
        }, 200);
    }

    function onFocus() {
        if (searchQuery.trim().length >= 2) {
            suggestions = searchUbigeo(searchQuery, 8);
            showSuggestions = suggestions.length > 0;
        }
    }
</script>

<div class="autocomplete-container">
    <!-- Tags seleccionados -->
    <div class="tags-input-wrapper">
        {#each selectedTags as tag, i}
            <span class="tag">
                <span class="tag-text">{tag.value}</span>
                <button type="button" class="tag-remove" on:click={() => removeTag(i)} title="Eliminar">
                    ✕
                </button>
            </span>
        {/each}
        <input
            bind:this={inputEl}
            type="text"
            bind:value={searchQuery}
            on:input={onInput}
            on:keydown={onKeydown}
            on:blur={onBlur}
            on:focus={onFocus}
            placeholder={selectedTags.length === 0 ? 'Buscar distrito, ciudad o código postal...' : 'Agregar otra ciudad...'}
            class="search-input"
            autocomplete="off"
        />
    </div>

    <!-- Dropdown de sugerencias -->
    {#if showSuggestions}
        <ul class="suggestions-dropdown">
            {#each suggestions as item, i}
                <li
                    class="suggestion-item"
                    class:highlighted={i === highlightedIndex}
                    on:mousedown|preventDefault={() => selectSuggestion(item)}
                    on:mouseenter={() => highlightedIndex = i}
                    role="option"
                    aria-selected={i === highlightedIndex}
                >
                    <div class="suggestion-main">
                        <span class="suggestion-distrito">{item.distrito}</span>
                        <span class="suggestion-cp">{item.codigo_postal}</span>
                    </div>
                    <div class="suggestion-detail">
                        {item.provincia}, {item.departamento}
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .autocomplete-container {
        position: relative;
        width: 100%;
    }

    .tags-input-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        padding: 4px 6px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: white;
        min-height: 38px;
        cursor: text;
        transition: border-color 0.2s;
    }

    .tags-input-wrapper:focus-within {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
    }

    .tag {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        color: #1e40af;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        line-height: 1.4;
        white-space: nowrap;
    }

    .tag-text {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .tag-remove {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 0 2px;
        font-size: 11px;
        line-height: 1;
        border-radius: 2px;
        display: flex;
        align-items: center;
    }

    .tag-remove:hover {
        background: #dbeafe;
        color: #1e40af;
    }

    .search-input {
        flex: 1;
        min-width: 180px;
        border: none !important;
        outline: none !important;
        padding: 4px 2px !important;
        font-size: 13px;
        background: transparent !important;
        box-shadow: none !important;
        margin: 0 !important;
    }

    .suggestions-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 50;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        margin-top: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        max-height: 280px;
        overflow-y: auto;
        list-style: none;
        padding: 4px;
    }

    .suggestion-item {
        padding: 8px 10px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.15s;
    }

    .suggestion-item:hover,
    .suggestion-item.highlighted {
        background: #f0f7ff;
    }

    .suggestion-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .suggestion-distrito {
        font-size: 13px;
        font-weight: 600;
        color: #1f2937;
    }

    .suggestion-cp {
        font-size: 12px;
        font-weight: 600;
        color: #3b82f6;
        background: #eff6ff;
        padding: 1px 6px;
        border-radius: 3px;
    }

    .suggestion-detail {
        font-size: 11px;
        color: #6b7280;
        margin-top: 2px;
    }
</style>
