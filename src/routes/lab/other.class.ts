// Definir la clase TrieNode para representar los nodos del Árbol Trie
class TrieNode {
    children: { [key: string]: TrieNode } = {};
    isEndOfWord: boolean = false;
}

// Clase Trie para la construcción y búsqueda del Árbol Trie
export class Trie {
    root: TrieNode = new TrieNode();

    insert(word: string) {
        let current = this.root;
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            if (!current.children[char]) {
                current.children[char] = new TrieNode();
            }
            current = current.children[char];
        }
        current.isEndOfWord = true;
    }

    search(query: string): boolean {
        let current = this.root;
        for (let i = 0; i < query.length; i++) {
            const char = query[i];
            if (!current.children[char]) {
                return false;
            }
            current = current.children[char];
        }
        return true;
    }
}