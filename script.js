/* =========================================================
   DADOS BRUTOS (fictícios) — 8º Ano
   Cada item é um OBJETO com os dados de uma disciplina.
   A lista toda é um ARRAY.
   ========================================================= */
const dadosBrutos = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

/* =========================================================
   FUNÇÃO: normalizarNota(valor)
   Converte qualquer formato de nota para a escala 0–10.
   Retorna null quando a nota ainda não foi lançada.
   ========================================================= */
function normalizarNota(valor) {
  // Vazio, null ou undefined = nota ainda não lançada
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se vier como texto, troca vírgula por ponto e converte para número
  let numero = valor;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  }

  // Se não virou um número válido, tratamos como inválido (null)
  if (isNaN(numero)) {
    return null;
  }

  // Regras de conversão para a escala 0–10
  if (numero >= 0 && numero <= 10) {
    return numero;          // já está na escala certa
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;     // 82 → 8,2 | 100 → 10,0
  }

  // Fora das regras: inválido
  return null;
}

/* =========================================================
   FUNÇÃO: calcularMedia(notas)
   Recebe um array com notas já normalizadas (ou null).
   Ignora as null e calcula a média apenas das válidas.
   Retorna null se não houver nenhuma nota válida.
   ========================================================= */
function calcularMedia(notas) {
  // Filtra apenas as notas que existem (não são null)
  const validas = notas.filter((n) => n !== null);

  // Nenhuma nota válida → média indisponível
  if (validas.length === 0) {
    return null;
  }

  // Soma todas e divide pela quantidade
  const soma = validas.reduce((acc, n) => acc + n, 0);
  return soma / validas.length;
}

/* =========================================================
   FUNÇÃO: somarFaltas(faltas)
   Recebe um array de números inteiros e retorna a soma.
   ========================================================= */
function somarFaltas(faltas) {
  return faltas.reduce((acc, f) => acc + f, 0);
}

/* =========================================================
   FUNÇÃO: definirSituacao(media)
   Define a situação da disciplina conforme a média.
   ========================================================= */
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= 6.0) {
    return "Bom desempenho";
  }
  return "Atenção";
}

/* =========================================================
   FUNÇÃO: formatarNota(nota)
   Formata a nota para exibição (1 casa decimal, com vírgula).
   Se for null, mostra "—".
   ========================================================= */
function formatarNota(nota) {
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace(".", ",");
}

/* =========================================================
   FUNÇÃO: criarCelula(texto, classe)
   Cria uma célula <td> para a tabela.
   ========================================================= */
function criarCelula(texto, classe) {
  const td = document.createElement("td");
  td.textContent = texto;
  if (classe) {
    td.classList.add(classe);
  }
  return td;
}

/* =========================================================
   FUNÇÃO: preencherTabela()
   Monta as 15 linhas da tabela a partir dos dados brutos.
   ========================================================= */
function preencherTabela() {
  const corpo = document.getElementById("corpo-tabela");

  // forEach percorre cada disciplina do array
  dadosBrutos.forEach((item) => {
    // Normaliza as três notas
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Calcula a média usando só as notas disponíveis
    const media = calcularMedia([n1, n2, n3]);

    // Soma as faltas
    const totalFaltas = somarFaltas(item.faltas);

    // Define a situação
    const situacao = definirSituacao(media);

    // Cria a linha <tr>
    const tr = document.createElement("tr");

    // Célula da disciplina
    tr.appendChild(criarCelula(item.disciplina));

    // Células das notas do trimestre
    tr.appendChild(criarCelula(formatarNota(n1)));
    tr.appendChild(criarCelula(formatarNota(n2)));
    tr.appendChild(criarCelula(formatarNota(n3)));

    // Célula da média
    tr.appendChild(criarCelula(formatarNota(media)));

    // Célula das faltas
    tr.appendChild(criarCelula(totalFaltas));

    // Célula da situação (com classe de cor)
    let classeSituacao = "situacao-pendente";
    if (situacao === "Bom desempenho") classeSituacao = "situacao-bom";
    if (situacao === "Atenção") classeSituacao = "situacao-atencao";
    tr.appendChild(criarCelula(situacao, classeSituacao));

    // Adiciona a linha pronta na tabela
    corpo.appendChild(tr);
  });
}

/* =========================================================
   FUNÇÃO: preencherCards()
   Calcula e exibe os valores dos cards de resumo.
   ========================================================= */
function preencherCards() {
  let somaMedias = 0;
  let qtdMedias = 0;
  let totalFaltas = 0;
  let qtdBom = 0;
  let qtdAtencao = 0;

  dadosBrutos.forEach((item) => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);
    const media = calcularMedia([n1, n2, n3]);

    // Soma faltas de todas as disciplinas
    totalFaltas += somarFaltas(item.faltas);

    // Conta situações
    const situacao = definirSituacao(media);
    if (situacao === "Bom desempenho") qtdBom++;
    if (situacao === "Atenção") qtdAtencao++;

    // Acumula a média (só quando existir)
    if (media !== null) {
      somaMedias += media;
      qtdMedias++;
    }
  });

  // Média geral do boletim
  const mediaGeral = qtdMedias > 0 ? somaMedias / qtdMedias : null;

  // ATENÇÃO: frequência FICTÍCIA apenas para demonstração.
  // No futuro, esse valor será tratado de outra forma (não vem das faltas).
  const frequenciaDemonstrativa = 92;

  // Atualiza os cards no DOM
  document.getElementById("media-geral").textContent = formatarNota(mediaGeral);
  document.getElementById("total-faltas").textContent = totalFaltas;
  document.getElementById("qtd-bom").textContent = qtdBom;
  document.getElementById("qtd-atencao").textContent = qtdAtencao;
  document.getElementById("frequencia").textContent = frequenciaDemonstrativa + "%";
  document.getElementById("frequencia-texto").textContent = "Frequência adequada";
}

/* =========================================================
   INICIALIZAÇÃO
   Roda quando a página termina de carregar.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  preencherTabela();
  preencherCards();
});