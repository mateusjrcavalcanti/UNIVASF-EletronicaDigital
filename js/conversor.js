/**
 *  Autor: Mateus Junior de Macedo Cavalcanti
 */

const converterButtonElement = document.querySelector(
  "#conversor .col-12 button"
);
const entryBaseElement = document.getElementById("entryBase");
const inputValueElement = document.getElementById("inputValue");
const outletBaseElement = document.getElementById("outletBase");
const outputValueElement = document.getElementById("outputValue");
const accordionHistoric = document.querySelector("#accordionHistoric");

//--> Eventos
converterButtonElement.addEventListener("click", function () {
  if (!!inputValueElement.checkValidity()) convertBases();
  return;
});

entryBaseElement.addEventListener("change", function () {
  inputValueElement.value = fitler(
    inputValueElement.value,
    entryBaseElement.value
  );
  validateConvertBaseToBase();
});

inputValueElement.addEventListener("keyup", function () {
  inputValueElement.value = fitler(
    inputValueElement.value,
    entryBaseElement.value
  );
});

inputValueElement.addEventListener("invalid", function () {});

//--> Conversão entre números e letras da Base 16
function convertLetraNumero(valor) {
  if (valor == "A") return "10";
  if (valor == "B") return "11";
  if (valor == "C") return "12";
  if (valor == "D") return "13";
  if (valor == "E") return "14";
  if (valor == "F") return "15";
  if (valor == "10") return "A";
  if (valor == "11") return "B";
  if (valor == "12") return "C";
  if (valor == "13") return "D";
  if (valor == "14") return "E";
  if (valor == "15") return "F";
  return valor;
}

//--> Faz a correspondencia entre o número da Base e seu respectivo Nome
function convertNomeBase(valor) {
  if (valor == "16") return "Hexadecimal";
  if (valor == "10") return "Decimal";
  if (valor == "8") return "Octal";
  if (valor == "2") return "Binário";
  return valor;
}

//--> Conversão de Base Decimal para uma Base Qualquer por meio da Divisão
function convertFromDecimalToBase(valor, base) {
  //Variáveis
  let dividendo = Math.floor(valor);
  let resultado = [],
    reverse = [];
  let fatorA = valor % 1;
  let produto,
    passos = [];
  //Realiza as operações para os números antes da virgula
  /* registra passo */ passos.push("Obtem a parte inteira: " + dividendo);
  while (dividendo >= base) {
    resultado.push(convertLetraNumero(dividendo % base));
    /* registra passo */ passos.push(
      "Realizando a divisão: " +
        dividendo +
        "/" +
        base +
        " = " +
        Math.floor(dividendo / base) +
        ", com resto: " +
        convertLetraNumero(dividendo % base)
    );
    dividendo = Math.floor(dividendo / base);
  }
  resultado.push(convertLetraNumero(dividendo));
  /* registra passo */ passos.push(
    "Pegamos os restos e o útimo quociente: " + resultado.join("")
  );
  resultado = resultado.reverse();
  /* registra passo */ passos.push(
    "Invertendo a ordem obtemos: " + resultado.join("")
  );
  //Realiza as operações para os números após da virgula
  /* registra passo */ if (fatorA != 0)
    passos.push("Obtem a parte decimal: " + fatorA);
  if (fatorA) resultado.push(".");
  while (fatorA != 0) {
    produto = fatorA * base;
    /* registra passo */ passos.push(
      "Realizando o produto da parte decimal pela base: " +
        fatorA +
        " * " +
        base +
        " = " +
        produto
    );
    /* registra passo */ passos.push(
      "Guardamos a parte inteira como resultado: " +
        convertLetraNumero(Math.floor(produto))
    );
    resultado.push(convertLetraNumero(Math.floor(produto)));
    fatorA = produto % 1;
  }
  /* registra passo */ if (fatorA != 0)
    passos.push(
      "Unindo a parte inteira com a parte decimal obtemos: " +
        resultado.join("")
    );
  //Retorna no formato de texto
  return [resultado.join(""), passos];
}

//--> Conversão a partir de uma Base Qualquer para Base Decimal por meio de Polinômios
function convertFromBaseToDecimal(v, b) {
  //Variáveis
  let string = v.toString();
  let base = b;
  let left = string.split(".")[0];
  let right = string.split(".")[1];
  let expoente,
    resultado,
    valor,
    total = 0,
    passos = [];
  //Procedimentos com os números anteriores o "."
  /* registra passo */ passos.push("Obtem a parte inteira: " + left);
  expoente = left.length;
  for (let i = 0; i < left.length; i++) {
    expoente--;
    valor = left[i];
    if (valor == "A") {
      valor = 10;
      /* registra passo */ passos.push("'A' equivale a '10'");
    }
    if (valor == "B") {
      valor = 11;
      /* registra passo */ passos.push("'B' equivale a '11'");
    }
    if (valor == "C") {
      valor = 12;
      /* registra passo */ passos.push("'C' equivale a '12'");
    }
    if (valor == "D") {
      valor = 13;
      /* registra passo */ passos.push("'D' equivale a '13'");
    }
    if (valor == "E") {
      valor = 14;
      /* registra passo */ passos.push("'E' equivale a '14'");
    }
    if (valor == "F") {
      valor = 15;
      /* registra passo */ passos.push("'F' equivale a '15'");
    }
    resultado = valor * Math.pow(base, expoente);
    /* registra passo */ passos.push(
      valor + " * " + base + "^" + expoente + " = " + resultado
    );
    total += resultado;
  }
  /* registra passo */ passos.push("Somando a parte inteira: " + total);
  //Procedimentos com os números após o "."
  expoente = 0;
  if (typeof right != "undefined") {
    /* registra passo */ passos.push("Obtem a parte decimal: " + right);
    for (let i = 0; i < right.length; i++) {
      expoente++;
      valor = right[i];
      if (valor == "A") {
        valor = 10;
        /* registra passo */ passos.push("'A' equivale a '10'");
      }
      if (valor == "B") {
        valor = 11;
        /* registra passo */ passos.push("'B' equivale a '11'");
      }
      if (valor == "C") {
        valor = 12;
        /* registra passo */ passos.push("'C' equivale a '12'");
      }
      if (valor == "D") {
        valor = 13;
        /* registra passo */ passos.push("'D' equivale a '13'");
      }
      if (valor == "E") {
        valor = 14;
        /* registra passo */ passos.push("'E' equivale a '14'");
      }
      if (valor == "F") {
        valor = 15;
        /* registra passo */ passos.push("'F' equivale a '15'");
      }
      resultado = valor * Math.pow(base, expoente * -1);
      /* registra passo */ passos.push(
        valor + " * " + base + "^" + expoente * -1 + " = " + resultado
      );
      total += resultado;
      passos.push("Somando tudo: " + total);
    }
  }
  return [total, passos];
}

//--> Conversão entre bases
function convertBases() {
  let result,
    caminho,
    passos = [],
    retorno,
    subConvertion = [];
  if (entryBaseElement.value == 10) {
    retorno = convertFromDecimalToBase(
      inputValueElement.value,
      outletBaseElement.value
    );
    caminho =
      '<a class="text-success text-decoration-none font-weight-bold">Decimal</a> <a class="text-dark text-decoration-none font-weight-bold">-></a> ' +
      '<a class="text-danger text-decoration-none font-weight-bold">' +
      convertNomeBase(outletBaseElement.value) +
      "</a><p></p>";
  } else {
    if (outletBaseElement.value != 10) {
      subConvertion = convertFromBaseToDecimal(
        inputValueElement.value,
        entryBaseElement.value
      );
      passos.push(convertNomeBase(entryBaseElement.value) + " -> Decimal");
      passos = passos.concat(subConvertion[1]);
      passos.push("Decimal -> " + convertNomeBase(outletBaseElement.value));
      retorno = convertFromDecimalToBase(
        subConvertion[0],
        outletBaseElement.value
      );
      caminho =
        '<a class="text-success text-decoration-none font-weight-bold">' +
        convertNomeBase(entryBaseElement.value) +
        '</a> <a class="text-dark text-decoration-none font-weight-bold">-></a> ' +
        '<a class="text-primary text-decoration-none font-weight-bold">Decimal</a> ' +
        '</a> <a class="text-dark text-decoration-none font-weight-bold">-></a> ' +
        '<a class="text-danger text-decoration-none font-weight-bold">' +
        convertNomeBase(outletBaseElement.value) +
        "</a><p></p>";
    } else {
      retorno = convertFromBaseToDecimal(
        inputValueElement.value,
        entryBaseElement.value
      );
      caminho =
        '<a class="text-success text-decoration-none font-weight-bold">' +
        convertNomeBase(entryBaseElement.value) +
        '</a> <a class="text-dark text-decoration-none font-weight-bold">-></a> ' +
        '<a class="text-danger text-decoration-none font-weight-bold">Decimal</a> ' +
        "</a><p></p>";
    }
  }
  result = retorno[0];
  passos = passos.concat(retorno[1]);
  outputValueElement.value = result;
  historicAddItem(
    entryBaseElement.value,
    outletBaseElement.value,
    inputValueElement.value,
    result,
    caminho,
    passos
  );
}

//--> Registra a conversão no histórico
function historicAddItem(
  entryBase,
  outletBase,
  inputValue,
  outputValue,
  caminho,
  passos
) {
  let now = Date.now();
  let passoAPasso = "";
  for (let i = 0; i < passos.length; i++) {
    passoAPasso +=
      '<p class="text-justify"><a class="text-danger text-decoration-none font-weight-bold">' +
      (i + 1) +
      "º</a> " +
      '</a> <a class="text-dark text-decoration-none font-weight-bold">' +
      passos[i] +
      "</a></p>";
  }
  contentHTML =
    '<div class="accordion-item text-white bg-secondary">' +
    '<h2 class="accordion-header" id="heading' +
    now +
    '">' +
    '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse' +
    now +
    '" aria-expanded="false" aria-controls="collapse' +
    now +
    '"><a class="text-success text-decoration-none">' +
    inputValue +
    "<sub>" +
    entryBase +
    '</sub></a>&nbsp;equivale a&nbsp;<a class="text-danger text-decoration-none">' +
    outputValue +
    "<sub>" +
    outletBase +
    "</sub></a>" +
    "</button>" +
    "</h2>" +
    '<div id="collapse' +
    now +
    '"class="accordion-collapse collapse" aria-labelledby="heading' +
    now +
    '"data-bs-parent="#accordionHistoric">' +
    '<div class="accordion-body">' +
    "<strong>Caminho da conversão:</strong> " +
    caminho +
    passoAPasso +
    "</div>" +
    "</div>" +
    "</div>";
  accordionHistoric.innerHTML = contentHTML + accordionHistoric.innerHTML;
}

//--> Validações
function validateConvertBaseToBase() {
  //Ativa todas as opções
  outletBaseElement.querySelectorAll("option").forEach(function (el) {
    el.disabled = false;
  });
  //Desativa Opção igual
  var option = outletBaseElement.querySelector(
    'option[value="' + entryBaseElement.value + '"]'
  );
  option.disabled = true;
  //Troca de opção
  let bases = ["2", "16", "10", "8"];
  bases.splice(bases.indexOf(entryBaseElement.value), 1);
  outletBaseElement.value = bases[0];
}
function fitler(string, base) {
  var string = string.split(""), ponto = 0;
  for (let i = 0; i < string.length; i++) {
    if(string[i] == '.') ponto++;
    if (
      !(
        (".01".includes(string[i]) && base >= 2) ||
        ("234567".includes(string[i]) && base >= 8) ||
        ("89".includes(string[i]) && base >= 10) ||
        ("ABCDEF".includes(string[i]) && base >= 16)
      ) || (ponto > 1  && string[i] == '.')
    ) {
      string[i] = " ";
    }
  }
  string = string.join("").trim()
  return (string == '.' ? 0 : string);
}
