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
   (Usada para os dados antigos do projeto e para dados da API)
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
   FUNÇÃO: obterFaltas(item)
   Devolve as 3 faltas (1º, 2º e 3º trimestre) de uma disciplina.
   Se algo vier faltando, usa 0 apenas para exibir na tela.
   ========================================================= */
function obterFaltas(item) {
  const lista = Array.isArray(item.faltas) ? item.faltas : [];
  return [0, 1, 2].map((i) => Number(lista[i]) || 0);
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
   (textContent é seguro: não interpreta HTML)
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
   Cria uma célula <td> que guarda um elemento (campo de edição).
   ========================================================= */
function criarCelulaComElemento(elemento) {
  const td = document.createElement("td");
  td.appendChild(elemento);
  return td;
}

/* =========================================================
   FUNÇÃO: copiarDados(lista)
   Faz uma cópia da lista para não alterar os dados originais.
   ========================================================= */
function copiarDados(lista) {
  return JSON.parse(JSON.stringify(lista));
}

/* =========================================================
   FUNÇÃO: mostrarMensagem(elemento, texto, tipo)
   Mostra uma mensagem na tela (tipo: "erro", "sucesso" ou vazio).
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
   Cria um campo de texto para editar nota ou falta.
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

  // Quando o estudante volta a digitar, tira a marca de erro
  campo.addEventListener("input", () => {
    campo.classList.remove("campo-invalido");
  });

  return campo;
}

/* =========================================================
   FUNÇÃO: preencherTabela()
   Monta as linhas da tabela a partir de dadosAtuais.
   Sempre limpa a tabela antes, para não duplicar linhas.
   ========================================================= */
function preencherTabela() {
  const corpo = document.getElementById("corpo-tabela");

  // Limpa a tabela antes de reconstruir
  corpo.replaceChildren();
  camposEdicao = [];

  // forEach percorre cada disciplina do array
  dadosAtuais.forEach((item) => {
    // Normaliza as três notas
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Calcula a média usando só as notas disponíveis
    const media = calcularMedia([n1, n2, n3]);

    // Pega e soma as faltas
    const faltas = obterFaltas(item);
    const totalFaltas = somarFaltas(faltas);

    // Define a situação
    const situacao = definirSituacao(media);

    // Cria a linha <tr>
    const tr = document.createElement("tr");

    // Célula da disciplina (o nome nunca é editável)
    tr.appendChild(criarCelula(item.disciplina));

    if (modoEdicao) {
      // ----- MODO EDIÇÃO: campos para notas e faltas -----
      const campoTri1 = criarCampoEdicao(n1 === null ? "" : String(n1).replace(".", ","), "Nota do 1º trimestre");
      const campoTri2 = criarCampoEdicao(n2 === null ? "" : String(n2).replace(".", ","), "Nota do 2º trimestre");
      const campoTri3 = criarCampoEdicao(n3 === null ? "" : String(n3).replace(".", ","), "Nota do 3º trimestre");

      const campoFalta1 = criarCampoEdicao(String(faltas[0]), "Faltas do 1º trimestre");
      const campoFalta2 = criarCampoEdicao(String(faltas[1]), "Faltas do 2º trimestre");
      const campoFalta3 = criarCampoEdicao(String(faltas[2]), "Faltas do 3º trimestre");

      tr.appendChild(criarCelulaComElemento(campoTri1));
      tr.appendChild(criarCelulaComElemento(campoTri2));
      tr.appendChild(criarCelulaComElemento(campoTri3));

      // Média continua sendo mostrada (com os dados já salvos)
      tr.appendChild(criarCelula(formatarNota(media)));

      // Célula das faltas com os 3 campos juntos
      const divFaltas = document.createElement("div");
      divFaltas.classList.add("faltas-edicao");
      divFaltas.appendChild(campoFalta1);
      divFaltas.appendChild(campoFalta2);
      divFaltas.appendChild(campoFalta3);
      tr.appendChild(criarCelulaComElemento(divFaltas));

      // Guarda os campos para ler na hora de salvar
      camposEdicao.push({
        tri1: campoTri1,
        tri2: campoTri2,
        tri3: campoTri3,
        faltas: [campoFalta1, campoFalta2, campoFalta3]
      });
    } else {
      // ----- MODO NORMAL: só mostra os valores -----
      tr.appendChild(criarCelula(formatarNota(n1)));
      tr.appendChild(criarCelula(formatarNota(n2)));
      tr.appendChild(criarCelula(formatarNota(n3)));

      // Célula da média
      tr.appendChild(criarCelula(formatarNota(media)));

      // Célula das faltas
      tr.appendChild(criarCelula(totalFaltas));
    }

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
   Os cards só têm o texto trocado, então não duplicam.
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

    // Soma faltas de todas as disciplinas
    totalFaltas += somarFaltas(obterFaltas(item));

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
   FUNÇÃO: atualizarTela()
   Reconstrói tabela e cards. Pode ser chamada várias vezes.
   ========================================================= */
function atualizarTela() {
  preencherTabela();
  preencherCards();
}

/* =========================================================
   FUNÇÃO: lerNotaDigitada(texto)
   Valida a nota digitada no editor.
   Aceita: vazio, número de 0 a 10 com ponto ou vírgula.
   Não aceita 75, 82, 100, -1, 11, abc.
   ========================================================= */
function lerNotaDigitada(texto) {
  const limpo = texto.trim();

  // Vazio vira null (nota não lançada)
  if (limpo === "") {
    return { valido: true, valor: null };
  }

  // Só dígitos, com no máximo um ponto ou uma vírgula decimal
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
   Valida as faltas: somente inteiro, zero ou maior.
   Vazio NÃO é aceito.
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
   Lê todos os campos, valida e monta a lista de disciplinas.
   Marca em vermelho os campos inválidos.
   ========================================================= */
function coletarEdicao() {
  let tudoValido = true;
  const disciplinas = [];

  dadosAtuais.forEach((item, indice) => {
    const campos = camposEdicao[indice];

    // Valida as 3 notas
    const r1 = lerNotaDigitada(campos.tri1.value);
    const r2 = lerNotaDigitada(campos.tri2.value);
    const r3 = lerNotaDigitada(campos.tri3.value);

    // Valida as 3 faltas
    const f1 = lerFaltaDigitada(campos.faltas[0].value);
    const f2 = lerFaltaDigitada(campos.faltas[1].value);
    const f3 = lerFaltaDigitada(campos.faltas[2].value);

    // Marca ou desmarca erro em cada campo
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

    // Monta a disciplina (mantém o nome e outros campos que já existiam)
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
   Abre o boletim pela API usando o PIN digitado.
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

  // DADOS DA API > DADOS LOCAIS
  if (resultado && resultado.dados !== null && resultado.dados !== undefined) {
    // Já existem dados salvos: usa exatamente o que veio da API
    if (!Array.isArray(resultado.dados.disciplinas)) {
      mostrarMensagem(mensagem, "Os dados recebidos estão em um formato inesperado.", "erro");
      botaoEntrar.disabled = false;
      return;
    }
    dadosAtuais = copiarDados(resultado.dados.disciplinas);
  } else {
    // Não existem dados salvos: usa os dados fictícios do projeto (sem salvar)
    dadosAtuais = copiarDados(dadosBrutos);
  }

  // Login bem-sucedido: guarda o PIN só na memória e limpa o campo
  pinSessao = pinDigitado;
  campoPin.value = "";
  mostrarMensagem(mensagem, "", "");
  botaoEntrar.disabled = false;

  // Troca a área de acesso pelo boletim
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
   Valida os campos e envia para a API com PUT.
   Se algo falhar, os campos continuam como o estudante digitou.
   ========================================================= */
async function salvarAlteracoes() {
  const botaoSalvar = document.getElementById("botao-salvar");
  const botaoCancelar = document.getElementById("botao-cancelar");
  const mensagem = document.getElementById("mensagem-edicao");

  // 1) Validar tudo antes de enviar
  const coleta = coletarEdicao();
  if (!coleta.valido) {
    mostrarMensagem(
      mensagem,
      "Há campos inválidos. Notas: de 0 a 10 (ou vazio). Faltas: número inteiro, 0 ou maior.",
      "erro"
    );
    return;
  }

  // 2) Enviar para a API
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

  // 3) Sucesso: atualiza os dados e a tela
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
   Roda quando a página termina de carregar.
   Antes do login aparece somente a área de PIN.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Mostra turma e chamada (apenas texto, não editável)
  document.getElementById("acesso-turma").textContent = CONFIG_ALUNO.turma;
  document.getElementById("acesso-chamada").textContent = CONFIG_ALUNO.numeroChamada;

  // Formulário de acesso por PIN
  document.getElementById("form-acesso").addEventListener("submit", (evento) => {
    evento.preventDefault();
    entrarComPin();
  });

  // Botões de edição
  document.getElementById("botao-alterar").addEventListener("click", iniciarEdicao);
  document.getElementById("botao-cancelar").addEventListener("click", cancelarEdicao);
  document.getElementById("botao-salvar").addEventListener("click", salvarAlteracoes);
});

pronto