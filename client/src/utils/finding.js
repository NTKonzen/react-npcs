function thisStartsWithOneOfThese(string, array) {
    let itDoes = false;
    array.forEach(value => {
        if (string.startsWith(value)) {
            itDoes = true;
        }
    })
    return itDoes;
}

export default thisStartsWithOneOfThese;