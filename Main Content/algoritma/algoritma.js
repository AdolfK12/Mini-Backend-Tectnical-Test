/* 
==========================
= REVERSE STRING FUNCTION =
==========================
*/

function reverseStringExceptNumber(str) {
  let numbers = "";
  let alphabets = "";

  for (let char of str) {
    if (char >= "0" && char <= "9") {
      numbers += char;
    } else {
      alphabets = char + alphabets;
    }
  }

  return alphabets + numbers;
}

console.log(reverseStringExceptNumber("NEGIE1"));

/* 
==========================
= LONGEST WORD FUNCTION  =
==========================
*/

function longest(sentence) {
  let words = sentence.split(" ");
  let maxLength = 0;
  let longestWord = "";

  for (let word of words) {
    if (word.length > maxLength) {
      maxLength = word.length;
      longestWord = word;
    }
  }

  return `${longestWord}: ${maxLength} character`;
}

console.log(longest("Saya sangat senang mengerjakan soal algoritma"));

/* 
=============================
= COUNT OCCURRENCES FUNCTION =
=============================
*/

function countOccurrences(input, query) {
  return query.map((q) => {
    let count = 0;
    for (let word of input) {
      if (word === q) count++;
    }
    return count;
  });
}

const INPUT = ["xc", "dz", "bbb", "dz"];
const QUERY = ["bbb", "ac", "dz"];
console.log(countOccurrences(INPUT, QUERY));

/* 
==========================
= MATRIX DIAGONAL FUNCTION=
==========================
*/

function diagonalDifference(matrix) {
  let diagonal1 = 0;
  let diagonal2 = 0;
  let length = matrix.length;

  for (let i = 0; i < length; i++) {
    diagonal1 += matrix[i][i];
    diagonal2 += matrix[i][length - 1 - i];
  }

  return Math.abs(diagonal1 - diagonal2);
}

const Matrix = [
  [1, 2, 0],
  [4, 5, 6],
  [7, 8, 9],
];
console.log(diagonalDifference(Matrix));
