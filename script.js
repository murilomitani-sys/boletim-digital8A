/* =========================================================
   CONFIGURAÇÃO FIXA DO ALUNO
   Turma e número de chamada ficam fixos neste projeto.
   ========================================================= */
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 25,
  apiUrl: "https://boletim-api.profbt.com.br"
};

/* =========================================================
   DADOS BRUTOS (fictícios) — 8º Ano
   Cada item é um OBJETO com os dados de uma disciplina.
   A lista toda é um ARRAY.
   Esses dados só são usados quando a API não tem dados salvos.
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
   ESTADO DA PÁGINA (fica somente na memória)
   - dadosAtuais: disciplinas que aparecem na tela agora
   - pinSessao: PIN digitado (nunca vai para localStorage, URL ou console)
   - modoEdicao: true quando o estudante está alterando os dados
   - camposEdicao: referências dos campos criados na edição
   ========================================================= */
let dadosAtuais = [];
let pinSessao = null;
let modoEdicao = false;
let camposEdicao = [];

/* =========================================================
   FUNÇÃO: normalizarNota(valor)
   Converte qualquer formato de nota para a escala 0–10.
   Retorna null quando a nota ainda não foi lançada.
   ========================================================= */
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  let numero = valor;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  }

  if (isNaN(numero)) {
    return null;
  }

  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  return null;
}

/* =========================================================
   FUNÇÃO: calcularMedia(notas)
   Ignora null e calcula a média apenas das válidas.
   Retorna null se não houver nenhuma nota válida.
   ========================================================= */
function calcularMedia(notas) {
  const validas = notas.filter((n) => n !== null);

  if (validas.length === 0) {
    return null;
  }

  const soma = validas.reduce((acc, n) => acc + n, 0);
  return soma / validas.length;
}

/* =========================================================
   FUNÇÃO: somarFaltas(faltas)
   ========================================================= */
function somarFaltas(faltas) {
  return faltas.reduce((acc, f) => acc + f, 0);
}

/* =========================================================
   FUNÇÃO: obterFaltas(item)
   Devolve as 3 faltas (1º, 2º e 3º trimestre) de uma disciplina.
   ========================================================= */
function obterFaltas(item) {
  const lista = Array.isArray(item.faltas) ? item.faltas : [];
  return [0, 1, 2].map((i) => Number(lista[i]) || 0);
}

/* =========================================================
   FUNÇÃO: definirSituacao(media)
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
   ========================================================= */
function formatarNota(nota) {
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace(".", ",");
}

/* =========================================================
   FUNÇÃO: criarCelula(texto, classe)
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
   FUNÇÃO: criarCelulaComElemento(elemento)
   ========================================================= */
function criarCelulaComElemento(elemento) {
  const td = document.createElement("td");
  td.appendChild(elemento);
  return td;
}

/* =========================================================
   FUNÇÃO: copiarDados(lista)
   ========================================================= */
function copiarDados(lista) {
  return JSON.parse(JSON.stringify(lista));
}

/* =========================================================
   FUNÇÃO: mostrarMensagem(elemento, texto, tipo)
   ========================================================= */
function mostrarMensagem(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.classList.remove("mensagem-erro", "mensagem-sucesso");
  if (tipo === "erro") {
    elemento.classList.add("mensagem-erro");
  }
  if (tipo === "sucesso") {
    elemento.classList.add("mensagem-sucesso");
  }
}

/* =========================================================
   FUNÇÃO: criarCampoEdicao(valorInicial, rotulo)
   ========================================================= */
function criarCampoEdicao(valorInicial, rotulo) {
  const campo = document.createElement("input");
  campo.type = "text";
  campo.inputMode = "decimal";
  campo.autocomplete = "off";
  campo.classList.add("campo-edicao");
  campo.value = valorInicial;
  campo.setAttribute("aria-label", rotulo);
  campo.title = rotulo;

  campo.addEventListener("input", () => {
    campo.classList.remove("campo-invalido");
  });

  return campo;
}

/* =========================================================
   FUNÇÃO: preencherTabela()
   ========================================================= */
function preencherTabela() {
  const corpo = document.getElementById("corpo-tabela");

  corpo.replaceChildren();
  camposEdicao = [];

  dadosAtuais.forEach((item) => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);
    const media = calcularMedia([n1, n2, n3]);
    const faltas = obterFaltas(item);
    const totalFaltas = somarFaltas(faltas);
    const situacao = definirSituacao(media);

    const tr = document.createElement("tr");
    tr.appendChild(criarCelula(item.disciplina));

    if (modoEdicao) {
      const campoTri1 = criarCampoEdicao(n1 === null ? "" : String(n1).replace(".", ","), "Nota do 1º trimestre");
      const campoTri2 = criarCampoEdicao(n2 === null ? "" : String(n2).replace(".", ","), "Nota do 2º trimestre");
      const campoTri3 = criarCampoEdicao(n3 === null ? "" : String(n3).replace(".", ","), "Nota do 3º trimestre");

      const campoFalta1 = criarCampoEdicao(String(faltas[0]), "Faltas do 1º trimestre");
      const campoFalta2 = criarCampoEdicao(String(faltas[1]), "Faltas do 2º trimestre");
      const campoFalta3 = criarCampoEdicao(String(faltas[2]), "Faltas do 3º trimestre");

      tr.appendChild(criarCelulaComElemento(campoTri1));
      tr.appendChild(criarCelulaComElemento(campoTri2));
      tr.appendChild(criarCelulaComElemento(campoTri3));
      tr.appendChild(criarCelula(formatarNota(media)));

      const divFaltas = document.createElement("div");
      divFaltas.classList.add("faltas-edicao");
      divFaltas.appendChild(campoFalta1);
      divFaltas.appendChild(campoFalta2);
      divFaltas.appendChild(campoFalta3);
      tr.appendChild(criarCelulaComElemento(divFaltas));

      camposEdicao.push({
        tri1: campoTri1,
        tri2: campoTri2,
        tri3: campoTri3,
        faltas: [campoFalta1, campoFalta2, campoFalta3]
      });
    } else {
      tr.appendChild(criarCelula(formatarNota(n1)));
      tr.appendChild(criarCelula(formatarNota(n2)));
      tr.appendChild(criarCelula(formatarNota(n3)));
      tr.appendChild(criarCelula(formatarNota(media)));
      tr.appendChild(criarCelula(totalFaltas));
    }

    let classeSituacao = "situacao-pendente";
    if (situacao === "Bom desempenho") classeSituacao = "situacao-bom";
    if (situacao === "Atenção") classeSituacao = "situacao-atencao";
    tr.appendChild(criarCelula(situacao, classeSituacao));

    corpo.appendChild(tr);
  });
}

/* =========================================================
   FUNÇÃO: preencherCards()
   ========================================================= */
function preencherCards() {
  let somaMedias = 0;
  let qtdMedias = 0;
  let totalFaltas = 0;
  let qtdBom = 0;
  let qtdAtencao = 0;

  dadosAtuais.forEach((item) => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);
    const media = calcularMedia([n1, n2, n3]);

    totalFaltas += somarFaltas(obterFaltas(item));

    const situacao = definirSituacao(media);
    if (situacao === "Bom desempenho") qtdBom++;
    if (situacao === "Atenção") qtdAtencao++;

    if (media !== null) {
      somaMedias += media;
      qtdMedias++;
    }
  });

  const mediaGeral = qtdMedias > 0 ? somaMedias / qtdMedias : null;
  const frequenciaDemonstrativa = 92;

  document.getElementById("media-geral").textContent = formatarNota(mediaGeral);
  document.getElementById("total-faltas").textContent = totalFaltas;
  document.getElementById("qtd-bom").textContent = qtdBom;
  document.getElementById("qtd-atencao").textContent = qtdAtencao;
  document.getElementById("frequencia").textContent = frequenciaDemonstrativa + "%";
  document.getElementById("frequencia-texto").textContent = "Frequência adequada";
}

/* =========================================================
   FUNÇÃO: atualizarTela()
   ========================================================= */
function atualizarTela() {
  preencherTabela();
  preencherCards();
  atualizarGraficos();
}

/* =========================================================
   FUNÇÃO: lerNotaDigitada(texto)
   ========================================================= */
function lerNotaDigitada(texto) {
  const limpo = texto.trim();

  if (limpo === "") {
    return { valido: true, valor: null };
  }

  if (!/^\d+([.,]\d+)?$/.test(limpo)) {
    return { valido: false, valor: null };
  }

  const numero = parseFloat(limpo.replace(",", "."));
  if (isNaN(numero) || numero < 0 || numero > 10) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: numero };
}

/* =========================================================
   FUNÇÃO: lerFaltaDigitada(texto)
   ========================================================= */
function lerFaltaDigitada(texto) {
  const limpo = texto.trim();

  if (!/^\d+$/.test(limpo)) {
    return { valido: false, valor: null };
  }

  const numero = parseInt(limpo, 10);
  if (!Number.isSafeInteger(numero) || numero < 0) {
    return { valido: false, valor: null };
  }

  return { valido: true, valor: numero };
}

/* =========================================================
   FUNÇÃO: coletarEdicao()
   ========================================================= */
function coletarEdicao() {
  let tudoValido = true;
  const disciplinas = [];

  dadosAtuais.forEach((item, indice) => {
    const campos = camposEdicao[indice];

    const r1 = lerNotaDigitada(campos.tri1.value);
    const r2 = lerNotaDigitada(campos.tri2.value);
    const r3 = lerNotaDigitada(campos.tri3.value);

    const f1 = lerFaltaDigitada(campos.faltas[0].value);
    const f2 = lerFaltaDigitada(campos.faltas[1].value);
    const f3 = lerFaltaDigitada(campos.faltas[2].value);

    const verificacoes = [
      [campos.tri1, r1],
      [campos.tri2, r2],
      [campos.tri3, r3],
      [campos.faltas[0], f1],
      [campos.faltas[1], f2],
      [campos.faltas[2], f3]
    ];

    verificacoes.forEach(([campo, resultado]) => {
      if (resultado.valido) {
        campo.classList.remove("campo-invalido");
      } else {
        campo.classList.add("campo-invalido");
        tudoValido = false;
      }
    });

    disciplinas.push({
      ...item,
      disciplina: item.disciplina,
      tri1: r1.valor,
      tri2: r2.valor,
      tri3: r3.valor,
      faltas: [f1.valor, f2.valor, f3.valor]
    });
  });

  return { valido: tudoValido, disciplinas: disciplinas };
}

/* =========================================================
   FUNÇÃO: entrarComPin()
   ========================================================= */
async function entrarComPin() {
  const campoPin = document.getElementById("campo-pin");
  const botaoEntrar = document.getElementById("botao-entrar");
  const mensagem = document.getElementById("mensagem-acesso");

  const pinDigitado = campoPin.value.trim();

  if (pinDigitado === "") {
    mostrarMensagem(mensagem, "Digite o PIN para entrar.", "erro");
    return;
  }

  botaoEntrar.disabled = true;
  mostrarMensagem(mensagem, "Conectando...", "");

  let resposta;
  try {
    resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });
  } catch (erro) {
    mostrarMensagem(mensagem, "Não foi possível conectar ao servidor. Tente novamente.", "erro");
    botaoEntrar.disabled = false;
    return;
  }

  if (resposta.status === 401) {
    mostrarMensagem(mensagem, "Turma, chamada ou PIN inválidos.", "erro");
    botaoEntrar.disabled = false;
    return;
  }

  if (resposta.status === 429) {
    mostrarMensagem(mensagem, "Muitas tentativas. Aguarde um minuto e tente novamente.", "erro");
    botaoEntrar.disabled = false;
    return;
  }

  if (!resposta.ok) {
    mostrarMensagem(mensagem, "Não foi possível abrir o boletim. Tente novamente.", "erro");
    botaoEntrar.disabled = false;
    return;
  }

  let resultado;
  try {
    resultado = await resposta.json();
  } catch (erro) {
    mostrarMensagem(mensagem, "Não foi possível conectar ao servidor. Tente novamente.", "erro");
    botaoEntrar.disabled = false;
    return;
  }

  if (resultado && resultado.dados !== null && resultado.dados !== undefined) {
    if (!Array.isArray(resultado.dados.disciplinas)) {
      mostrarMensagem(mensagem, "Os dados recebidos estão em um formato inesperado.", "erro");
      botaoEntrar.disabled = false;
      return;
    }
    dadosAtuais = copiarDados(resultado.dados.disciplinas);
  } else {
    dadosAtuais = copiarDados(dadosBrutos);
  }

  pinSessao = pinDigitado;
  campoPin.value = "";
  mostrarMensagem(mensagem, "", "");
  botaoEntrar.disabled = false;

  document.getElementById("area-acesso").hidden = true;
  document.getElementById("area-boletim").hidden = false;

  modoEdicao = false;
  atualizarTela();
}

/* =========================================================
   FUNÇÕES DE EDIÇÃO
   ========================================================= */
function iniciarEdicao() {
  modoEdicao = true;
  document.getElementById("botao-alterar").hidden = true;
  document.getElementById("botao-salvar").hidden = false;
  document.getElementById("botao-cancelar").hidden = false;
  mostrarMensagem(document.getElementById("mensagem-edicao"), "", "");
  atualizarTela();
}

function cancelarEdicao() {
  modoEdicao = false;
  document.getElementById("botao-alterar").hidden = false;
  document.getElementById("botao-salvar").hidden = true;
  document.getElementById("botao-cancelar").hidden = true;
  mostrarMensagem(document.getElementById("mensagem-edicao"), "", "");
  atualizarTela();
}

/* =========================================================
   FUNÇÃO: salvarAlteracoes()
   ========================================================= */
async function salvarAlteracoes() {
  const botaoSalvar = document.getElementById("botao-salvar");
  const botaoCancelar = document.getElementById("botao-cancelar");
  const mensagem = document.getElementById("mensagem-edicao");

  const coleta = coletarEdicao();
  if (!coleta.valido) {
    mostrarMensagem(
      mensagem,
      "Há campos inválidos. Notas: de 0 a 10 (ou vazio). Faltas: número inteiro, 0 ou maior.",
      "erro"
    );
    return;
  }

  botaoSalvar.disabled = true;
  botaoCancelar.disabled = true;
  mostrarMensagem(mensagem, "Salvando...", "");

  let resposta;
  try {
    resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: coleta.disciplinas
        }
      })
    });
  } catch (erro) {
    mostrarMensagem(mensagem, "Não foi possível conectar ao servidor. Tente novamente.", "erro");
    botaoSalvar.disabled = false;
    botaoCancelar.disabled = false;
    return;
  }

  if (resposta.status === 401) {
    mostrarMensagem(mensagem, "Turma, chamada ou PIN inválidos.", "erro");
    botaoSalvar.disabled = false;
    botaoCancelar.disabled = false;
    return;
  }

  if (resposta.status === 429) {
    mostrarMensagem(mensagem, "Muitas tentativas. Aguarde um minuto e tente novamente.", "erro");
    botaoSalvar.disabled = false;
    botaoCancelar.disabled = false;
    return;
  }

  if (!resposta.ok) {
    mostrarMensagem(mensagem, "Não foi possível salvar. Tente novamente.", "erro");
    botaoSalvar.disabled = false;
    botaoCancelar.disabled = false;
    return;
  }

  dadosAtuais = copiarDados(coleta.disciplinas);
  modoEdicao = false;
  document.getElementById("botao-alterar").hidden = false;
  document.getElementById("botao-salvar").hidden = true;
  document.getElementById("botao-cancelar").hidden = true;
  botaoSalvar.disabled = false;
  botaoCancelar.disabled = false;

  atualizarTela();
  mostrarMensagem(mensagem, "Dados salvos com sucesso.", "sucesso");
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("acesso-turma").textContent = CONFIG_ALUNO.turma;
  document.getElementById("acesso-chamada").textContent = CONFIG_ALUNO.numeroChamada;

  document.getElementById("form-acesso").addEventListener("submit", (evento) => {
    evento.preventDefault();
    entrarComPin();
  });

  document.getElementById("botao-alterar").addEventListener("click", iniciarEdicao);
  document.getElementById("botao-cancelar").addEventListener("click", cancelarEdicao);
  document.getElementById("botao-salvar").addEventListener("click", salvarAlteracoes);
});

/* =========================================================
   GRÁFICOS — SOMENTE LEITURA
   Esta seção apenas lê dadosAtuais, calcula e desenha.
   NÃO escreve em notas, faltas, disciplinas ou estado.
   NÃO faz fetch. NÃO altera o payload da API.
   ========================================================= */

let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

/* Referência interna usada SOMENTE pelo JS para avaliar a situação
   geral de faltas. Não é exibida em lugar nenhum da interface. */
const REFERENCIA_INTERNA_FALTAS = 350;

/* -------- Cor do texto/grade/tooltip conforme o tema -------- */
function obterCoresTema() {
  const raiz = getComputedStyle(document.documentElement);
  const ler = (nome, padrao) =>
    (raiz.getPropertyValue(nome) || "").trim() || padrao;

  return {
    azulPrincipal: ler("--azul-principal", "#1e5fbf"),
    azulClaro: ler("--azul-claro", "#e6f0fc"),
    azulBorda: ler("--azul-borda", "#c5dbf7"),
    textoEscuro: ler("--texto-escuro", "#1f2937"),
    textoSuave: ler("--texto-suave", "#5b6b82"),
    verdeBom: ler("--verde-bom", "#1a7f4b"),
    laranjaAtencao: ler("--laranja-atencao", "#b45309"),
    cinzaNeutro: ler("--cinza-neutro", "#6b7280"),
    branco: ler("--branco", "#ffffff")
  };
}

/* -------- CÁLCULOS (sem tocar em dadosAtuais) -------- */

/* Array de { disciplina, media } — media pode ser null. */
function calcularMediasPorDisciplina() {
  return dadosAtuais.map((item) => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);
    return {
      disciplina: item.disciplina,
      media: calcularMedia([n1, n2, n3])
    };
  });
}

/* [mediaTri1, mediaTri2, mediaTri3] — cada uma pode ser null. */
function calcularEvolucaoGeral() {
  const mediasTri = [[], [], []];

  dadosAtuais.forEach((item) => {
    const notas = [
      normalizarNota(item.tri1),
      normalizarNota(item.tri2),
      normalizarNota(item.tri3)
    ];
    notas.forEach((n, i) => {
      if (n !== null) {
        mediasTri[i].push(n);
      }
    });
  });

  return mediasTri.map((lista) => {
    if (lista.length === 0) return null;
    const soma = lista.reduce((acc, n) => acc + n, 0);
    return soma / lista.length;
  });
}

/* { tri1, tri2, tri3, total } — faltas por trimestre e total interno. */
function calcularFaltasPorTrimestre() {
  let tri1 = 0;
  let tri2 = 0;
  let tri3 = 0;

  dadosAtuais.forEach((item) => {
    const faltas = obterFaltas(item);
    tri1 += faltas[0];
    tri2 += faltas[1];
    tri3 += faltas[2];
  });

  return {
    tri1,
    tri2,
    tri3,
    total: tri1 + tri2 + tri3
  };
}

/* Aplica estado de perigo ao card de faltas — apenas classe + badge. */
function avaliarPerigoFaltas(total) {
  const card = document.getElementById("card-faltas");
  const estado = document.getElementById("estado-faltas");
  if (!card || !estado) return;

  // Faixa crítica: somente quando atinge a referência interna.
  if (total >= REFERENCIA_INTERNA_FALTAS) {
    card.classList.add("perigo");
    estado.replaceChildren();
    const badge = document.createElement("span");
    badge.classList.add("badge-perigo");
    badge.textContent = "Perigo";
    estado.appendChild(badge);
  } else {
    card.classList.remove("perigo");
    estado.replaceChildren();
  }
}

/* -------- DESENHO DOS GRÁFICOS -------- */

function atualizarGraficoMedias() {
  const canvas = document.getElementById("grafico-medias-disciplinas");
  if (!canvas || typeof Chart === "undefined") return;

  if (graficoMedias) {
    graficoMedias.destroy();
    graficoMedias = null;
  }

  const cores = obterCoresTema();
  const itens = calcularMediasPorDisciplina();
  const rotulos = itens.map((i) => i.disciplina);
  const valores = itens.map((i) => (i.media === null ? null : i.media));

  graficoMedias = new Chart(canvas, {
    type: "bar",
    data: {
      labels: rotulos,
      datasets: [
        {
          label: "Média",
          data: valores,
          backgroundColor: cores.azulPrincipal,
          borderColor: cores.azulPrincipal,
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          min: 0,
          max: 10,
          ticks: { color: cores.textoSuave },
          grid: { color: cores.azulBorda }
        },
        y: {
          ticks: { color: cores.textoEscuro, autoSkip: false, font: { size: 11 } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.x;
              if (v === null || v === undefined) {
                return "Nota ainda não disponível";
              }
              return "Média: " + v.toFixed(1).replace(".", ",");
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const canvas = document.getElementById("grafico-evolucao-trimestres");
  if (!canvas || typeof Chart === "undefined") return;

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
    graficoEvolucao = null;
  }

  const cores = obterCoresTema();
  const medias = calcularEvolucaoGeral();

  graficoEvolucao = new Chart(canvas, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [
        {
          label: "Média geral",
          data: medias,
          borderColor: cores.azulPrincipal,
          backgroundColor: cores.azulClaro,
          pointBackgroundColor: cores.azulPrincipal,
          pointBorderColor: cores.branco,
          pointRadius: 5,
          tension: 0.3,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { color: cores.textoSuave },
          grid: { color: cores.azulBorda }
        },
        x: {
          ticks: { color: cores.textoEscuro },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y;
              if (v === null || v === undefined) {
                return "Sem notas neste trimestre";
              }
              return "Média: " + v.toFixed(1).replace(".", ",");
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoFaltas() {
  const canvas = document.getElementById("grafico-faltas-trimestres");
  if (!canvas || typeof Chart === "undefined") return;

  if (graficoFaltas) {
    graficoFaltas.destroy();
    graficoFaltas = null;
  }

  const cores = obterCoresTema();
  const dados = calcularFaltasPorTrimestre();

  // Avalia situação geral (usa apenas referência interna; não exibe 350).
  avaliarPerigoFaltas(dados.total);

  graficoFaltas = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [
        {
          label: "Faltas",
          data: [dados.tri1, dados.tri2, dados.tri3],
          backgroundColor: cores.azulPrincipal,
          borderColor: cores.azulPrincipal,
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: cores.textoSuave, precision: 0 },
          grid: { color: cores.azulBorda }
        },
        x: {
          ticks: { color: cores.textoEscuro },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y;
              return v + (v === 1 ? " falta" : " faltas");
            }
          }
        }
      }
    }
  });
}

function atualizarGraficos() {
  if (typeof Chart === "undefined") return;
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}

// Só para conferir o comportamento visual — não persiste nada
const original = dadosAtuais;
dadosAtuais = original.map(d => ({ ...d, faltas: [200, 200, 200] }));
atualizarGraficos();
// Para reverter:
dadosAtuais = original;
atualizarGraficos();