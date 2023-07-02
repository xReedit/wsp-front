let frequencies = {}
let nrOfNgrams = 0


// Calculates a key (string) that can be used for a map
function arrayToKey(arr) {
    let result = '('
    arr.forEach(function (x) {
        result += x + ', '
    })
    result = result.substr(0, result.length - 2) + ')'
    return result
};

// Updates the statistics for the new ngram
function countNgrams(ngram) {
    nrOfNgrams++
    const key = arrayToKey(ngram)
    if (!frequencies[key]) {
        frequencies[key] = 0
    }
    frequencies[key]++
}

// If stats is true, statistics will be returned
export const ngrams = function (sequence, n, startSymbol, endSymbol, stats) {
    const result = []
    frequencies = {}
    nrOfNgrams = 0

    // if (!_.isArray(sequence)) {
    //     sequence = tokenizer.tokenize(sequence)
    // }

    const count = sequence.length - n + 1

    // Check for left padding
    if (typeof startSymbol !== 'undefined' && startSymbol !== null) {
        // Create an array of (n) start symbols
        const blanks = []
        for (let i = 0; i < n; i++) {
            blanks.push(startSymbol)
        }

        // Create the left padding
        for (let p = n - 1; p > 0; p--) {
            // Create a tuple of (p) start symbols and (n - p) words
            const ngram = blanks.slice(0, p).concat(sequence.slice(0, n - p))
            result.push(ngram)
            if (stats) {
                countNgrams(ngram)
            }
        }
    }

    // Build the complete ngrams
    for (let i = 0; i < count; i++) {
        const ngram = sequence.slice(i, i + n)
        result.push(ngram)
        if (stats) {
            countNgrams(ngram)
        }
    }

    // Check for right padding
    if (typeof endSymbol !== 'undefined' && endSymbol !== null) {
        // Create an array of (n) end symbols
        const blanks = []
        for (let i = 0; i < n; i++) {
            blanks.push(endSymbol)
        }

        // create the right padding
        for (let p = n - 1; p > 0; p--) {
            // Create a tuple of (p) start symbols and (n - p) words
            const ngram = sequence.slice(sequence.length - p, sequence.length).concat(blanks.slice(0, n - p))
            result.push(ngram)
            if (stats) {
                countNgrams(ngram)
            }
        }
    }

    if (stats) {
        // Count frequencies
        const Nr = {}
        Object.keys(frequencies).forEach(function (key) {
            if (!Nr[frequencies[key]]) {
                Nr[frequencies[key]] = 0
            }
            Nr[frequencies[key]]++
        })

        // Return the ngrams AND statistics
        return {
            ngrams: result,
            frequencies: frequencies,
            Nr: Nr,
            numberOfNgrams: nrOfNgrams
        }
    } else { // Do not break existing API of this module
        return result
    }
}