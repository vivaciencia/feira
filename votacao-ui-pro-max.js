/* ============================================================
   VIVA Ciência 2026 — Votação Popular (protótipo front-end)
   Simula no navegador o que o backend Laravel/Livewire/Reverb fará:
   login Google, voto único, janela de votação e ranking ao vivo
   com todos os projetos e voto direto em cada linha.
   ============================================================ */

(function () {
  'use strict';

  /* ─── Configuração ─────────────────────────────────────── */
  var OPEN_AT = new Date('2026-11-24T20:00:00-03:00');
  var CLOSE_AT = new Date('2026-11-26T12:00:00-03:00');
  var SNAPSHOT_MS = 2200;      // cadência do "broadcast" do ranking

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasFlip = hasGsap && typeof window.Flip !== 'undefined';
  if (hasFlip) gsap.registerPlugin(Flip);

  /* ─── Armazenamento seguro ─────────────────────────────── */
  var store = {
    get: function (k, fb) {
      try { var v = window.localStorage.getItem(k); return v === null ? fb : JSON.parse(v); } catch (e) { return fb; }
    },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem storage */ } },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) { /* sem storage */ } }
  };

  /* ─── Dados ─────────────────────────────────────────────
     Projetos homologados para a Mostra (APROVADOS PARA MOSTRA DE PROJETOS).
     As 7 áreas seguem as do Ensino Médio; nos níveis Fundamental I e II, as
     categorias combinadas entram na área mais próxima. Votos são fictícios. */
  var CATEGORIES = [
    { id: 'humanas', name: 'Ciências Humanas e Sociais', short: 'Humanas', icon: 'users' },
    { id: 'biologicas', name: 'Ciências Biológicas', short: 'Biológicas', icon: 'sprout' },
    { id: 'quimicas', name: 'Ciências Químicas e de Materiais', short: 'Químicas', icon: 'flask' },
    { id: 'saude', name: 'Ciências Biomédicas e da Saúde', short: 'Saúde', icon: 'activity' },
    { id: 'exatas', name: 'Ciências Exatas', short: 'Exatas', icon: 'x-circle' },
    { id: 'ambiental', name: 'Engenharia Energética, Agronômica e Ambiental', short: 'Ambiental', icon: 'leaf' },
    { id: 'engenharias', name: 'Engenharia Elétrica e Mecânica', short: 'Engenharias', icon: 'cpu' }
  ];
  var LEVEL_SHORT = { 'Fundamental I': 'Fund. I', 'Fundamental II': 'Fund. II', 'Ensino Médio': 'Médio' };
  var PROJECTS = [
    { code: "01F1CHS", cat: "humanas", level: "Fundamental I", title: "Entre Memórias e Histórias: Construindo Biografias, Valorizando Vidas", students: ["Lívia Barbosa Silva"], advisor: "Babyanne Cristina Alencar da Silva Sousa", coadvisor: "Jerusa Jardim Silva", school: "Escola Municipal Manoel Lira", city: "Araguaína – TO", votes: 40 },
    { code: "02F1CHS", cat: "humanas", level: "Fundamental I", title: "Resíduos e Recursos: A Prática da Coleta Seletiva, Reciclagem e Compostagem na Formação da Consciência Ambiental", students: ["Enzo Henrique Sousa Silva", "Byanca Pinho Ribeiro"], advisor: "Babyanne Cristina Alencar da Silva Sousa", coadvisor: "Joana Araújo Reis Pereira", school: "Escola Municipal Manoel Lira", city: "Araguaína – TO", votes: 20 },
    { code: "03F1CHS", cat: "humanas", level: "Fundamental I", title: "Alimentos de Origem Indígena no Cotidiano Brasileiro: Diversidade, Presença e Valor Nutricional", students: ["Jade Evelyn Sobral dos Santos", "Marina Tavares Pedrosa", "Livia Lopes Aquino"], advisor: "Valdineide Maria de Menezes", coadvisor: "Jannyny de Oliveira Fogaça Rodrigues", school: "Escola Municipal Benedito Canuto Braga", city: "Araguaína – TO", votes: 56 },
    { code: "01F1CBS", cat: "biologicas", level: "Fundamental I", title: "Saberes da Minha Terra: Levantamento sobre o Uso Familiar de Chás Tradicionais", students: ["Melissa Pereira de Brito"], advisor: "Babyanne Cristina Alencar da Silva Sousa", coadvisor: "Helaine da Silva Nascimento Aires", school: "Escola Municipal Manoel Lira", city: "Araguaína – TO", votes: 145 },
    { code: "02F1CBS", cat: "biologicas", level: "Fundamental I", title: "Prevenção de Doenças na Infância por Meio de Uma Alimentação Equilibrada e Sustentável nas Turmas do 5° Ano", students: ["Jady Lorrayra Araujo Costa", "João Miguel de Sales Moura", "Wallacy Gustavo Morais de Almeida"], advisor: "Islene Lima dos Santos", coadvisor: "Babyanne Cristina Alencar da Silva Sousa", school: "Escola Municipal Manoel Lira", city: "Araguaína – TO", votes: 46 },
    { code: "01F1CEA", cat: "ambiental", level: "Fundamental I", title: "Do Plano ao Espaço: Desenvolvimento de um Laboratório Móvel para Aprendizagem da Geometria", students: ["Kaic Gabriel Jardim"], advisor: "Charlene Rose Reis Silva", coadvisor: "Babyanne Cristina Alencar da Silva Sousa", school: "Escola Municipal Manoel Lira", city: "Araguaína – TO", votes: 28 },
    { code: "02F1CEA", cat: "ambiental", level: "Fundamental I", title: "Defensivos Naturais: Plantas Protegendo Plantas – Alternativas Sustentáveis para o Cuidado da Horta e do Meio Ambiente", students: ["Davi Lucas Ferreira da Cruz", "Any Gabrielly de Jesus Tavares", "Maria Eduarda Silva dos Santos"], advisor: "Simone de Jesus Santos", coadvisor: "Jeane Candida Ferreira", school: "Escola Municipal José Nogueira", city: "Araguaína – TO", votes: 54 },
    { code: "03F1CEA", cat: "ambiental", level: "Fundamental I", title: "HIDROLIRA: Plantar, Cultivar e Colher Saúde", students: ["Maria Fernanda Machado de Sousa"], advisor: "Babyanne Cristina Alencar da Silva Sousa", coadvisor: "Romaria Leandro Morais", school: "Escola Municipal Manoel Lira", city: "Araguaína – TO", votes: 41 },
    { code: "04F1CEA", cat: "ambiental", level: "Fundamental I", title: "Do Viveiro à Escola: Educação Ambiental e Arborização Consciente do Espaço Escolar", students: ["Joao Lucas Ribeiro de Melo", "Maria Hellena Souza Brito Lopes", "Nicolas Rocha Santos de Sousa"], advisor: "Ismael Barbosa Chaves", coadvisor: "Marineide Ferreira de Sousa", school: "Escola Municipal de Tempo Integral William Castelo Branco Martins", city: "Araguaína – TO", votes: 44 },
    { code: "01F2CHS", cat: "humanas", level: "Fundamental II", title: "Gamificação nas Aulas de Educação Física: Efeitos de uma Intervenção Pedagógica sobre a Motivação de Estudantes do Ensino Fundamental II", students: ["Hallana Thauany Brandão Lima", "Larah Maiely Monteiro Ribeiro", "Deyvid Pereira da Silva"], advisor: "Rodrigo Weyll Ferreira", coadvisor: "Taliely Magalhães Passos Teixeira", school: "Colégio Estadual Welder Maria de Abreu Sales", city: "Araguaína – TO", votes: 207 },
    { code: "02F2CHS", cat: "humanas", level: "Fundamental II", title: "Diário Lilás: O Impacto de Uma Intervenção Pedagógica no Reconhecimento da Violência Contra a Mulher", students: ["Célio Luiz Ribeiro Mendes", "Kayany Barros Chaves", "Wayla Vitoria Sousa da Silva"], advisor: "Thiago Fernandes dos Reis", coadvisor: "Janaína Modesto Alvino", school: "Colégio Estadual Welder Maria de Abreu Sales", city: "Araguaína – TO", votes: 29 },
    { code: "03F2CHS", cat: "humanas", level: "Fundamental II", title: "Do Copia e Cola ao Letramento Digital: Impactos do Uso Consciente e Orientado da Inteligência Artificial no Processo de Reescrita e na Autonomia de Estudantes do Ensino Fundamental", students: ["Isabella Bastos Rodrigues", "Isabela Bruno Nunes"], advisor: "Raimunda Araujo da Silveira", coadvisor: "Francisco Glenison Menezes Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 50 },
    { code: "04F2CHS", cat: "humanas", level: "Fundamental II", title: "Expressão Visual e Identidade: Um Estudo Gráfico sobre as Subculturas de Araguaína", students: ["Melline Lyara Soares Rippel", "Luiz Felipe Oliveira Sardinha"], advisor: "Murylo Bruno Rocha Carneiro", coadvisor: "Fabrício Mendes Moura", school: "Escola Estadual Paroquial Luiz Augusto", city: "Araguaína – TO", votes: 41 },
    { code: "05F2CHS", cat: "humanas", level: "Fundamental II", title: "Do Virtual ao Físico: Tecnologia e Sustentabilidade na Recriação de Jogos Digitais nas Aulas de Educação Física", students: ["Gabriel Souza Alves", "Daniel Matias de Sousa Silva", "Thiago Callebe da Silva Nunes"], advisor: "Lucas Correia da Silva", school: "Escola Estadual Paroquial Luiz Augusto", city: "Araguaína – TO", votes: 35 },
    { code: "06F2CHS", cat: "humanas", level: "Fundamental II", title: "Vozes Que Não Se Calam: Lendo Conceição Evaristo e Ouvindo as Mulheres que Fazem Nossa História", students: ["Nicolly Rodrigues Magalhães", "Julyanna Vitória Sousa Pereira"], advisor: "Maria Luzia Alves da Silva", coadvisor: "Moab Machado Costa Ribeiro", school: "Escola Estadual Paroquial São Pedro", city: "Ananás – TO", votes: 10 },
    { code: "07F2CHS", cat: "humanas", level: "Fundamental II", title: "A Linguagem como Mecanismo de Absolvição: Uma Análise Linguístico-Discursiva Sobre a Construção de Antagonistas e Heróis nos Contos de Fadas Clássicos", students: ["Sophia Milhomem", "Ana Júlia Lima Trindade"], advisor: "Raimunda Araujo da Silveira", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 41 },
    { code: "08F2CHS", cat: "humanas", level: "Fundamental II", title: "A Influência da Realidade Virtual como Recurso Pedagógico nas Aulas de Educação Física: Um Estudo de Intervenção nas Escolas Públicas de Fundamental II", students: ["Ana Maria de Sousa Campos", "Emilly Lorrany Rodrigues de Assis", "Ana Beatriz Silva Santos"], advisor: "Rodrigo Weyll Ferreira", coadvisor: "Taliely Magalhães Passos Teixeira", school: "Colégio Estadual Welder Maria de Abreu Sales", city: "Araguaína – TO", votes: 10 },
    { code: "09F2CHS", cat: "humanas", level: "Fundamental II", title: "Além do Feed: Investigação dos Impactos dos Vídeos Curtos na Atenção dos Estudantes e Desenvolvimento de Plataforma Digital de Conscientização", students: ["Isac Corrêa Martins"], advisor: "Francisco Glenison Menezes Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 39 },
    { code: "01F2BIO", cat: "biologicas", level: "Fundamental II", title: "Impressão 3D na Escola: Construção de Modelos Anatômicos e Didáticos para a Inovação no Ensino de Ciências no Ensino Fundamental", students: ["Joao Pedro Noleto da Silva", "Ian de Jesus Araujo Sousa", "Izzadora Silva Sousa"], advisor: "Ronaldo Souza da Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 54 },
    { code: "02F2BIO", cat: "biologicas", level: "Fundamental II", title: "Análise da Percepção dos Alunos Sobre a Contaminação Microbiana em Utensílios Compartilhados e Hábitos de Saúde Individual", students: ["Manuela Araújo Mascarenha", "Sabrina Vitória de Souza Batista", "Larissa Pereira da Silva"], advisor: "Larissa Silva de Freitas", school: "Escola Estadual Prof. Alfredo Nasser", city: "Araguaína – TO", votes: 46 },
    { code: "03F2BIO", cat: "biologicas", level: "Fundamental II", title: "Investigando o Ambiente Natural de Araguaína-TO por meio da Plataforma BDIA/IBGE", students: ["Luis Gonzaga Neto Oliveira dos Santos", "Victor Gabriel Castro Tavares", "Kamilla Miguel Barbosa"], advisor: "Jair de Oliveira Miranda", coadvisor: "Marcio Luiz Duque Carvalho de Sousa", school: "Colégio Esportivo Militar do Estado do Tocantins Jardenir Jorge Frederico", city: "Araguaína – TO", votes: 11 },
    { code: "04F2BIO", cat: "biologicas", level: "Fundamental II", title: "Minha Garrafa, Minha Responsabilidade: Investigação sobre a Higiene de Garrafas e Copos Reutilizáveis no Ambiente Escolar", students: ["Sabryna Andrade Silva"], advisor: "Isa Aparecida Carlos Eleotério", school: "Colégio Estadual Getúlio Vargas", city: "Ananás – TO", votes: 31 },
    { code: "05F2BIO", cat: "biologicas", level: "Fundamental II", title: "Sabores e Saúde: A Importância da Alimentação para o Crescimento e o Aprendizado", students: ["Davi de Oliveira Marinho", "Gabriela da Silva Guido", "Iza de Carvalho Matias"], advisor: "Ronaldo Souza da Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 28 },
    { code: "06F2BIO", cat: "biologicas", level: "Fundamental II", title: "Sol, Sombra e Crescimento: Um Estudo Comparativo sobre a Influência da Intensidade Luminosa no Desenvolvimento Inicial do Phaseolus vulgaris (Feijão)", students: ["Ana Livia Nascimento Lopes", "Sofia Macedo", "Heloísa Freitas Leite"], advisor: "Jakson Silva Almeida Souza", school: "Colégio Estadual Getúlio Vargas", city: "Ananás – TO", votes: 0 },
    { code: "07F2BIO", cat: "biologicas", level: "Fundamental II", title: "Biorremediação Orgânica: Eficiência da Borra de Café e Casca de Ovo na Imobilização de Metais e Redução da Acidez do Solo", students: ["Ana Cecilia Silva Carvalho", "Isabel Teixeira Bonamigo"], advisor: "Ana Julia Nascimento Santos", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 50 },
    { code: "08F2BIO", cat: "biologicas", level: "Fundamental II", title: "Impacto das Queimadas na Biodiversidade e Saúde Escolar em Araguaína: Diagnóstico Local e Propostas Educativas", students: ["Carlos Eduardo Vilanova de Lucena", "Marco Antônio Carneiro Alves", "Victor Gabriel dos Santos"], advisor: "Ana Julia Nascimento Santos", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 34 },
    { code: "09F2BIO", cat: "biologicas", level: "Fundamental II", title: "Cidades-Esponja: Modelo Experimental e Monitoramento Tecnológico de Soluções Sustentáveis de Drenagem Urbana para Redução de Alagamentos", students: ["Sophia Dias Cavalcante", "Sophia Lopes Figueiredo"], advisor: "Ana Julia Nascimento Santos", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 38 },
    { code: "10F2BIO", cat: "biologicas", level: "Fundamental II", title: "Raízes do Nosso Lugar: Implantação de um Espaço de Conservação e Aprendizagem com Espécies Nativas no Ambiente Escolar", students: ["Maria Cecilia Vieira Chaves", "Moabe Rodrigues de Sousa", "Isis Radassa Araujo Paz"], advisor: "Isa Aparecida Carlos Eleotério", school: "Colégio Estadual Getúlio Vargas", city: "Ananás – TO", votes: 99 },
    { code: "11F2BIO", cat: "biologicas", level: "Fundamental II", title: "Diário de Um Inseto: O Clima e a Vida dos Animais no Ambiente", students: ["Luma Yvis Nunes Lima", "Davi de Araujo Vieira", "Ingryd Ribeiro Pardim"], advisor: "Ronaldo Souza da Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 75 },
    { code: "12F2BIO", cat: "biologicas", level: "Fundamental II", title: "Cultivo De Microverde Em Ambiente Domiciliar", students: ["Maria Ritha Ferreira dos Santos"], advisor: "Kanítian Wálery Pereira Soares", coadvisor: "Vagner Alves dos Santos", school: "Escola SESI de Referência", city: "Araguaína – TO", votes: 86 },
    { code: "13F2BIO", cat: "biologicas", level: "Fundamental II", title: "Origem - Universo Fantástico de criaturas inspiradas em Espécies Biológicas", students: ["Rebecca Haylla da Conceição", "Enzo Gabriel Fernandes Vanderleis"], advisor: "Ronaldo Souza da Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 94 },
    { code: "14F2BIO", cat: "biologicas", level: "Fundamental II", title: "Rios Invisíveis: O Impacto dos Microplásticos e Poluição nos Ecossistemas Aquáticos Brasileiros e Ações de Preservação", students: ["Marianna Felix Silva", "Lais Lorranny Dias Rodrigues", "Maria Odete Paiva Magalhães"], advisor: "Ana Julia Nascimento Santos", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 0 },
    { code: "15F2BIO", cat: "biologicas", level: "Fundamental II", title: "A Importância das Abelhas Nativas Sem Ferrão na Conservação da Biodiversidade do Cerrado Araguainense", students: ["Adriel Dias Teixeira", "Arthur Silva Matos do Vale", "Kallel Dias da Mota Castro"], advisor: "Francisco Glenison Menezes Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 40 },
    { code: "01F2CQM", cat: "quimicas", level: "Fundamental II", title: "Do Resíduo Ao Produto: Ciência, Sustentabilidade e Criatividade na Escola", students: ["Maria Thaylany Morais dos Santos", "Wanny Vitória Batista Nunes"], advisor: "Moab Machado Costa Ribeiro", coadvisor: "Letticia Cortez Negreiros", school: "Escola Estadual Paroquial São Pedro", city: "Ananás – TO", votes: 32 },
    { code: "02F2CQM", cat: "quimicas", level: "Fundamental II", title: "Desenvolvimento de Estruturas Porosas à Base De Hidroxiapatita para Adsorção de Corante em Meio Aquoso", students: ["Luiz Bernardo Paiva Rezende", "Vinicius Rodrigues Moreira"], advisor: "David Samuel Silva Rosa", school: "Escola Estadual Paroquial Luiz Augusto", city: "Araguaína – TO", votes: 0 },
    { code: "03F2CQM", cat: "quimicas", level: "Fundamental II", title: "Bioplástico de Casca de Pequi: Uma Alternativa Sustentável para o Aproveitamento de Resíduos Orgânicos", students: ["Livia Caroline de Lima Pimenta", "Khaua Vhyctor da Silva Aquino", "Joao Emanoel Reis Alves"], advisor: "Francisco Glenison Menezes Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 0 },
    { code: "04F2CQM", cat: "quimicas", level: "Fundamental II", title: "Produção de Bioplástico a partir da Casca da Laranja: Uma Alternativa Sustentável para o Reaproveitamento de Resíduos", students: ["Wlisses Gabriel Feitosa Carmino Leite Costa", "William Gomes de Sousa", "Carlos Vinícius"], advisor: "Francisco Glenison Menezes Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 66 },
    { code: "01F2CBS", cat: "saude", level: "Fundamental II", title: "Mel: Educação, Saúde, Vida", students: ["Otávio Carvalho Chini", "Bernardo Nascimento Cruz", "Artur Gabriel de Andrade e Silva"], advisor: "Francisco Glenison Menezes Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 73 },
    { code: "02F2CBS", cat: "saude", level: "Fundamental II", title: "Inquérito de Saúde Escolar e Mapeamento de Sintomas na Rotina de Tempo Integral para Proposta de Uso da Fitoterapia", students: ["Ana Clara da Silva Lima", "Emilly Figueira Silveira", "Rafaeli Nascimento Vanin"], advisor: "Francisco Glenison Menezes Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 22 },
    { code: "03F2CBS", cat: "saude", level: "Fundamental II", title: "Saúde na Escola: Uma Investigação Sobre Hábitos de Higiene e Microrganismos no Ambiente Escolar", students: ["Lorenna Castro Silva", "Anna Lyvia Gomes Ferreira", "Anna Alyce Gomes Ferreira"], advisor: "Jair de Oliveira Miranda", school: "Colégio Esportivo Militar do Estado do Tocantins Jardenir Jorge Frederico", city: "Araguaína – TO", votes: 126 },
    { code: "04F2CBS", cat: "saude", level: "Fundamental II", title: "Educar e Repelir: Todos Contra a Dengue", students: ["Maria Vitória Sales Borges", "Maria Clara Silva Coelho", "Maria Fernanda Alves Leite"], advisor: "Moab Machado Costa Ribeiro", school: "Escola Estadual Paroquial São Pedro", city: "Ananás – TO", votes: 22 },
    { code: "01F2EAA", cat: "ambiental", level: "Fundamental II", title: "EcoSense Garden: Plataforma de Monitoramento Climático e Irrigação Automatizada em Jardim Escolar", students: ["Brenno Abraão Monteiro de Macedo"], advisor: "Ronaldo Souza da Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 40 },
    { code: "02F2EAA", cat: "ambiental", level: "Fundamental II", title: "Fotobiorreator Tubular Automatizado com Arduino para Captura e Mitigação de CO2 Atmosférico", students: ["Arthur Sousa e Silva", "João Elias Ferreira de Azevedo"], advisor: "Ana Julia Nascimento Santos", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 87 },
    { code: "03F2EAA", cat: "ambiental", level: "Fundamental II", title: "Plantas Ornamentais na Escola: Comparativo de Eficiência no Enraizamento e do Crescimento em Substratos Tradicionais vs. Compostagem Escolar", students: ["Isadora Dias Borges", "Maria Vitória Espíndola da Conceição", "Nicole Soares Cunha"], advisor: "Fabrício Mendes Moura", coadvisor: "Mayke Eduardo de Araujo", school: "Escola Estadual Paroquial Luiz Augusto", city: "Araguaína – TO", votes: 92 },
    { code: "04F2EAA", cat: "ambiental", level: "Fundamental II", title: "EcoLoop: Soluções Sustentáveis e Inovação em Reciclagem e Reutilização", students: ["Sâmila Arceno de Miranda", "Hevilly Cortez da Silva Sousa", "Murilo Rodrigues de Lima"], advisor: "Francisco Glenison Menezes Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 29 },
    { code: "05F2EAA", cat: "ambiental", level: "Fundamental II", title: "Do Lanche à Horta: Aproveitamento de Resíduos Orgânicos da Alimentação Escolar para Produção de Composto Orgânico", students: ["Júlia Cirqueira da Silva"], advisor: "Isa Aparecida Carlos Eleotério", school: "Colégio Estadual Getúlio Vargas", city: "Ananás – TO", votes: 11 },
    { code: "06F2EAA", cat: "ambiental", level: "Fundamental II", title: "Eficiência Biométrica da Compostagem Escolar: Comparativo entre Restos de Frutas Soltas e Trituradas", students: ["Thayla Sophia de Paula Bueno Aguiar", "Giovana Coelho Curcino", "Ana Alicy Ferreira da Silva"], advisor: "Fabrício Mendes Moura", coadvisor: "Mayke Eduardo de Araujo", school: "Escola Estadual Paroquial Luiz Augusto", city: "Araguaína – TO", votes: 27 },
    { code: "07F2EAA", cat: "ambiental", level: "Fundamental II", title: "ANIMA-TECH: Desenvolvimento de um Protótipo Animatrônico de Baixo Custo com Arduino", students: ["Helen Moreira Silva", "Edgar Melo Moura", "Laura Sofia Lopes Ribeiro"], advisor: "Beni Isac Silva Feitosa", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 155 },
    { code: "08F2EAA", cat: "ambiental", level: "Fundamental II", title: "Entre Duas Águas: Investigação da Qualidade da Água e Desenvolvimento de Uma Solução de Baixo Custo para o Povoado São João, Ananás–TO", students: ["Yanny Rinata Bezerra Matos"], advisor: "Isa Aparecida Carlos Eleotério", school: "Colégio Estadual Getúlio Vargas", city: "Ananás – TO", votes: 16 },
    { code: "09F2EAA", cat: "ambiental", level: "Fundamental II", title: "EcoPonto Araguaína: Desenvolvimento de uma Plataforma Digital para Localização e Destinação Adequada de Medicamentos, Pilhas e Baterias", students: ["Aylla da Silva Santos", "Rhanna Maria Magalhães Silva Souza", "Amanda Figueira da Silva"], advisor: "Beni Isac Silva Feitosa", coadvisor: "Aline Dias Horas", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 23 },
    { code: "10F2EAA", cat: "ambiental", level: "Fundamental II", title: "Do Descarte À Criação: Produção De Papel Reciclado Na Escola", students: ["Mikael Ramos de Oliveira", "Marckus Henrique Silva Ribeiro"], advisor: "Moab Machado Costa Ribeiro", coadvisor: "Letticia Cortez Negreiros", school: "Escola Estadual Paroquial São Pedro", city: "Ananás – TO", votes: 16 },
    { code: "01F2EEM", cat: "engenharias", level: "Fundamental II", title: "Encontre Eplaapp: Aplicativo para os Achados e Perdidos da Escola Estadual Paroquial Luiz Augusto", students: ["Bernardo Oliveira Campos", "Kaio Henrique Batista Bezerra", "Luis Felipe Fernandes Almeida"], advisor: "Murylo Bruno Rocha Carneiro", coadvisor: "Fabrício Mendes Moura", school: "Escola Estadual Paroquial Luiz Augusto", city: "Araguaína – TO", votes: 57 },
    { code: "02F2EEM", cat: "engenharias", level: "Fundamental II", title: "MathAccess: Jogo Digital Inclusivo de Algoritmos e Geometria para Computador e Celular", students: ["Murillo da Silva Matos", "Victor Hugo de Melo Santiago"], advisor: "Murylo Bruno Rocha Carneiro", coadvisor: "Fabrício Mendes Moura", school: "Escola Estadual Paroquial Luiz Augusto", city: "Araguaína – TO", votes: 60 },
    { code: "03F2EEM", cat: "engenharias", level: "Fundamental II", title: "Desenvolvimento de um Volante de Simulação Automotiva com Force Feedback de Baixo Custo", students: ["Ricardo Gabriel", "Nykolas Henrick Barbosa", "Nathan Cardoso Alencar"], advisor: "Beni Isac Silva Feitosa", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 48 },
    { code: "04F2EEM", cat: "engenharias", level: "Fundamental II", title: "Projeto Orion: Mão Robótica Biônica com Controle por Luva Sensorizada", students: ["José Pedro Borges", "Emanuel Evangelista Oliveira"], advisor: "Ronaldo Souza da Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 83 },
    { code: "05F2EEM", cat: "engenharias", level: "Fundamental II", title: "VisionTech - Óculos de Auxílio à Locomoção de Pessoas com Deficiência Visual", students: ["Carlos Alberto Souza Tassani", "Kássia dá Silva Ribeiro", "Hugo Ghabriel de Sousa Andrade"], advisor: "Francisco Glenison Menezes Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 35 },
    { code: "06F2EEM", cat: "engenharias", level: "Fundamental II", title: "Maquete Interativa e Dinâmica da Circulação Geral dos Ventos e Convecção Do Ar", students: ["Sofia Lima Souza", "Nicole Lima de Falchi", "Arthur Lopes Souza"], advisor: "Fabrício Mendes Moura", school: "Escola Estadual Paroquial Luiz Augusto", city: "Araguaína – TO", votes: 30 },
    { code: "07F2EEM", cat: "engenharias", level: "Fundamental II", title: "Olhos no Universo: Montagem Equatorial Motorizada de Baixo Custo para Telescópios Refletores Newtonianos (140mm e 180mm) com Materiais Recicláveis", students: ["Pedro Guilherme Rodrigues da Silva"], advisor: "Francisco Glenison Menezes Silva", school: "Colégio Militar do Estado do Tocantins Jorge Humberto Camargo", city: "Araguaína – TO", votes: 74 },
    { code: "08F2EEM", cat: "engenharias", level: "Fundamental II", title: "Do Notebook ao Bolso: Transformando Descarte em Energia", students: ["Daniel Oliveira Gouveia"], advisor: "Lucas Ramos de Sousa", school: "Colégio Estadual Welder Maria de Abreu Sales", city: "Araguaína – TO", votes: 26 },
    { code: "01MDCHS", cat: "humanas", level: "Ensino Médio", title: "Letramento Digital em Cena: Análise da Recepção do Site Escribia Na Formulação de Prompts Inteligentes", students: ["Maria Cecilia de Vasconcelos Cunha Agostinho", "Sophia Silva de Abreu", "Talita Araújo de Carvalho"], advisor: "Felipe Gonçalves Carneiro", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 260 },
    { code: "02MDCHS", cat: "humanas", level: "Ensino Médio", title: "A Política de Assistência Estudantil no Instituto Federal do Tocantins (IFTO): Estado, Educação Profissional e o Esporte na Permanência e Êxito", students: ["Luana Gomes Lima"], advisor: "David Anderson Fernandes de Aguiar", coadvisor: "Iury Gomes de Oliveira", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 72 },
    { code: "03MDCHS", cat: "humanas", level: "Ensino Médio", title: "Conexão e Ecossistema Amparo Azul - II: Um Recurso Digital para Orientação e Conhecimento do TEA", students: ["Bennício Bernard Santana Macêdo", "Maria Eduarda Nascimento", "Ana Clara Alves Nascimento"], advisor: "Hebert Lima Batista", coadvisor: "Iury Gomes de Oliveira", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 159 },
    { code: "04MDCHS", cat: "humanas", level: "Ensino Médio", title: "Site Educativo \"Conflitos Esquecidos\": Uma Abordagem Educativa Sobre o Apagamento Histórico de Conflitos Brasileiros", students: ["Pedro Filho Cardoso de Sousa"], advisor: "Wellington Sampaio da Silva", coadvisor: "Dácio Alves Pereira de Oliveira", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 32 },
    { code: "05MDCHS", cat: "humanas", level: "Ensino Médio", title: "Mulheres na Tecnologia e Indústria 4.0: A Contribuição do IFTO - Campus Colinas na Formação de Mulheres no Eixo Tecnológico", students: ["Camille Santos da Motta"], advisor: "Lara Fernanda Portilho dos Santos", school: "IFTO — Campus Colinas", city: "Colinas – TO", votes: 49 },
    { code: "06MDCHS", cat: "humanas", level: "Ensino Médio", title: "Bruxaria e Poder: A Construção do Controle Social Sobre a Mulher da Idade Média à Atualidade", students: ["Esther Alves dos Santos", "Thiago Vieira de Sousa"], advisor: "Lara Fernanda Portilho dos Santos", school: "IFTO — Campus Colinas", city: "Colinas – TO", votes: 75 },
    { code: "07MDCHS", cat: "humanas", level: "Ensino Médio", title: "Relação de Indicadores Antropométricos Como Fatores de Risco para Doença Cardiovascular nos Estudantes do 1º Ano de Informática do Campus Araguaína", students: ["Sabrina Oliveira", "Davi Dias Marinho"], advisor: "David Anderson Fernandes de Aguiar", coadvisor: "Darlan Lopes de Farias", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 24 },
    { code: "08MDCHS", cat: "humanas", level: "Ensino Médio", title: "Criminologia e Mídia: A Influência das Produções True Crime na Compreensão Popular Sobre a Mente de Assassinos", students: ["Ana Clara Santana Silva", "Emilly de Souza Nascimento"], advisor: "Agda Rodrigues Santos", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 43 },
    { code: "01MDBIO", cat: "biologicas", level: "Ensino Médio", title: "Eletricidade Produzida A Partir Dos Lixões: A Utilização Do Biogás Para Gerar Energia Elétrica — Estudo De Caso em Araguaína-TO", students: ["Cauã Gabriel Arcanjo dos Santos", "João Emanoel Silva Mota", "Washington Oliveira Sousa"], advisor: "Eliane Medeiros Ribeiro", school: "Escola Estadual Professora Silvandira de Sousa Lima", city: "Araguaína – TO", votes: 108 },
    { code: "02MDBIO", cat: "biologicas", level: "Ensino Médio", title: "Atividade Antibacteriana do Óleo Essencial de Mesosphaerum Suaveolens (L.) Kuntze Contra Staphylococcus Aureus e Escherichia Coli", students: ["Samuel Barros de Souza", "Aylla Alves de Moura", "Juliany Sousa Silva"], advisor: "Lucas da Costa Carvalho", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 13 },
    { code: "03MDBIO", cat: "biologicas", level: "Ensino Médio", title: "AQUA-LONTRA: Análise da Qualidade da Água e Desenvolvimento de Ecobarreira para a Conservação do Rio Lontra", students: ["Ana Victória Lima de Lacerda Nascimento", "Kimberly Silva Bringel", "Maria Laura Silva Bringel"], advisor: "João Paulo de Sousa Coelho", coadvisor: "Morgana Sabrina da Silva Mano", school: "Educandário de Araguaína", city: "Araguaína – TO", votes: 6 },
    { code: "04MDBIO", cat: "biologicas", level: "Ensino Médio", title: "O Escudo de Húmus: Biorremediação do Solo com Ácidos Húmicos para Redução da Exposição de Polinizadores a Pesticidas Sistêmicos (Ensaio de Simulação)", students: ["Pamela Sousa Milhomem"], advisor: "Damião Leonardo Alexandre da Silva", school: "Colégio Militar do Estado do Tocantins Dr. José Aluisio da Silva Luz", city: "Araguaína – TO", votes: 29 },
    { code: "05MDBIO", cat: "biologicas", level: "Ensino Médio", title: "Enganando o Cérebro: Como Ilusões de Óptica Revelam o Processamento Visual Humano", students: ["Ilana Oliveira Sousa", "Lara Franciny Ribeiro dos Santos", "Stephane Dias dos Santos"], advisor: "Mario de Souza Lima e Silva", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 0 },
    { code: "06MDBIO", cat: "biologicas", level: "Ensino Médio", title: "Produção de Biogás a Partir da Decomposição de Resíduos Orgânicos em um Biodigestor", students: ["Heloysa Alvina Martins dos Santos", "Vinicius dos Reis Silva", "Saulo Boucinhas Dias Marcelino"], advisor: "João Paulo de Sousa Coelho", coadvisor: "Elizany Alves de Araújo", school: "Educandário de Araguaína", city: "Araguaína – TO", votes: 36 },
    { code: "07MDBIO", cat: "biologicas", level: "Ensino Médio", title: "Biochar e Microrganismos Benéficos podem Acelerar a Compostagem e Melhorar a Qualidade Agronômica do Composto Produzido?", students: ["Arthur Rafael Batista Vasconcelos Gadelha"], advisor: "Aparecida Barbosa de Paiva", school: "IFTO — Campus Colinas", city: "Colinas – TO", votes: 0 },
    { code: "08MDBIO", cat: "biologicas", level: "Ensino Médio", title: "Microrganismos Promotores de Crescimento Aumentam a Tolerância de Plantas a Diferentes Estresses Ambientais?", students: ["Isabella Macedo Lima", "Thierry Gabriel Vieira de Sousa"], advisor: "Aparecida Barbosa de Paiva", school: "IFTO — Campus Colinas", city: "Colinas – TO", votes: 0 },
    { code: "09MDBIO", cat: "biologicas", level: "Ensino Médio", title: "Mais Verde, Mais Vida? A Cobertura Vegetal Influencia A Diversidade e as Funções Ecológicas dos Insetos?", students: ["José Roberto de Freitas Junior", "Erismar Dias Nunes"], advisor: "Aparecida Barbosa de Paiva", school: "IFTO — Campus Colinas", city: "Colinas – TO", votes: 71 },
    { code: "10MDBIO", cat: "biologicas", level: "Ensino Médio", title: "Arborização Urbana Como Infraestrutura Verde: Evidências e Desafios para O Planejamento das Cidades da Região Norte", students: ["Heitor Viana Dutra", "Samuel Oliveira Franco"], advisor: "Vagner Alves dos Santos", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 16 },
    { code: "01MDCQM", cat: "quimicas", level: "Ensino Médio", title: "Influência dos métodos de extração nas características de extratos vegetais do Cerrado tocantinense e sua aplicação na produção de sabonetes artesanais", students: ["Yasmim Vitória Gomes da Silva", "Ana Karoliny Ferreira da Silva", "Otávio Fabiano F. D. Silva"], advisor: "Guilherme Nunes Lucena", school: "IFTO — Campus Colinas", city: "Colinas – TO", votes: 67 },
    { code: "02MDCQM", cat: "quimicas", level: "Ensino Médio", title: "FAKE HONEY 2.0: Kit de Adulteração do Mel", students: ["Sofia Catarina Rodrigues Ferreira", "Vitória Santiago da Silva", "Edilana Silva Oliveira"], advisor: "Hebert Lima Batista", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 29 },
    { code: "03MDCQM", cat: "quimicas", level: "Ensino Médio", title: "Influência da Composição nas Propriedades Fisico-Mecânicas e na Degradação de Biocompósitos à Base de Amido e Resíduos Vegetais", students: ["Gustavo dos Santos Ribeiro", "Nicolas Gabriel de Carvalho Oliveira", "Vitória Vieira Miranda"], advisor: "Tiago Sousa Moraes", coadvisor: "Elizany Alves de Araújo", school: "Educandário de Araguaína", city: "Araguaína – TO", votes: 228 },
    { code: "04MDCQM", cat: "quimicas", level: "Ensino Médio", title: "Prata Verde - Desenvolvimento de Embalagem de Papel com Propriedades Antibacterianas Utilizando Nanoparticulas de Prata Obtidas com Síntese Verde", students: ["Eloa Rocha Mendes"], advisor: "Jacqueline Soares Carvalho Correia", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 98 },
    { code: "05MDCQM", cat: "quimicas", level: "Ensino Médio", title: "Desenvolvimento e Produção de Sabonete e Esfoliante Fitoterápico a partir do Extrato de Aroeira (Schinus Terebinthifolia)", students: ["Damares Esther Amorim da Costa Silva", "Maria Clara Araújo da Silva"], advisor: "Jacqueline Soares Carvalho Correia", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 20 },
    { code: "06MDCQM", cat: "quimicas", level: "Ensino Médio", title: "Desenvolvimento e Avaliação de Um Creme Capilar À Base de Extrato de Mutamba (Guazuma Ulmifolia): Aproveitamento da Biodiversidade Regional Para O Cuidado Capilar", students: ["Eloá Victoria Santana Santos", "Kaylany Vilar dos Santos Castro"], advisor: "Jacqueline Soares Carvalho Correia", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 62 },
    { code: "07MDCQM", cat: "quimicas", level: "Ensino Médio", title: "Do Resíduo ao Biomaterial: A Incorporação de Extrato da Casca de Pequi pode Melhorar as Propriedades e Conferir Atividade Antimicrobiana a Biofilmes Biodegradáveis?", students: ["Katyelle Pereira de Morais", "Maria Eduarda Sousa Cardoso"], advisor: "Aparecida Barbosa de Paiva", school: "IFTO — Campus Colinas", city: "Colinas – TO", votes: 43 },
    { code: "08MDCQM", cat: "quimicas", level: "Ensino Médio", title: "Do Resíduo ao Bioplástico: Folhas de Nim e Capim-Braquiária podem Melhorar as Propriedades de Materiais Biodegradáveis?", students: ["Nathalia Pereira Matos", "Luiz Eduardo da Luz Xavier", "Rafael Castro da Silva"], advisor: "Aparecida Barbosa de Paiva", school: "IFTO — Campus Colinas", city: "Colinas – TO", votes: 55 },
    { code: "09MDCQM", cat: "quimicas", level: "Ensino Médio", title: "Desenvolvimento de um Hidratante para Mãos e Pés à Base de Óleo de Buriti", students: ["Nathielly Andrade Oliveira", "Emanuela Moreira de Sousa", "Ruhan Negreiros Belfort"], advisor: "Jacqueline Soares Carvalho Correia", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 23 },
    { code: "01MDCBS", cat: "saude", level: "Ensino Médio", title: "LembreMED: Plataforma mHealth para Gestão e Monitoramento da Adesão Medicamentosa", students: ["João Gabryel Dias Santos", "Diogo Araujo Nunes"], advisor: "Iury Gomes de Oliveira", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 29 },
    { code: "02MDCBS", cat: "saude", level: "Ensino Médio", title: "Formulação e Avaliação da Atividade Antibacteriana de Hidrogel Bioativo à Base de Aroeira e Mel para Tratamento de Lesões Cutâneas", students: ["Jamille de Oliveira Borges Rebouças", "Maria Emanuela Viana Silva", "Sarah Sabiny Esteves de Lima"], advisor: "Jonathon Viana Silva", coadvisor: "Hebert Lima Batista", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 35 },
    { code: "03MDCBS", cat: "saude", level: "Ensino Médio", title: "HiperHidroTech: Hiperidrose, e como a Saúde e a Tecnologia Lida com Ela", students: ["Elisa Gabriella Neponuceno Correia", "Emilly Cirqueira Soares", "Erika Silva Ferreira"], advisor: "Anivaldo Pereira Duarte Junior", coadvisor: "Vagner Alves dos Santos", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 47 },
    { code: "04MDCBS", cat: "saude", level: "Ensino Médio", title: "Máscara Facial À Base De Mel e Óleos Essenciais", students: ["Gabriella Costa Sousa", "Lhanna Victoria Oliveira Santana", "Heloisa de Sousa Campos"], advisor: "Hebert Lima Batista", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 59 },
    { code: "05MDCBS", cat: "saude", level: "Ensino Médio", title: "Curativo Biodegradável à Base de Mel e Própolis da Abelha Frieseomelitta Varia em Matriz de Colágeno para Tratamento de Feridas Diabéticas", students: ["Isac Ribeiro da Silva"], advisor: "Hebert Lima Batista", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 23 },
    { code: "06MDCBS", cat: "saude", level: "Ensino Médio", title: "Desenvolvimento de um Repelente Corporal Hidratante com Fragrância de Mel e Efeito Iluminador", students: ["Júlia Silva Barbosa", "Maria Clara Pereira da Conceição Portilho", "Vitória Duques de Sousa"], advisor: "Angelo Cassio Bezerra Nascimento", coadvisor: "José Dilson Francisco da Silva", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 85 },
    { code: "07MDCBS", cat: "saude", level: "Ensino Médio", title: "SOS-3: Ciência da Decisão em Emergências: Desenvolvimento e Validação Experimental de um Sistema Visual para Otimizar a Tomada de Decisões em Primeiros Socorros", students: ["Álvaro Magno Resende Azevedo Apinajé", "Guilherme Almeida Lima"], advisor: "Angelo Cassio Bezerra Nascimento", coadvisor: "Felipe Gonçalves Carneiro", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 41 },
    { code: "08MDCBS", cat: "saude", level: "Ensino Médio", title: "Safe+ - Sistema de Avaliação Física Escolar Inclusiva", students: ["Maria Clara Ribeiro Martins", "Lara Isabely Padilha Machado", "Michelle Costa Morais"], advisor: "Iury Gomes de Oliveira", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 65 },
    { code: "09MDCBS", cat: "saude", level: "Ensino Médio", title: "Estudo da Viabilidade e da Farmacocinética de Filmes Orodispersíveis Fitoterápicos à Base de Matricaria Recutita Para o Alívio da Ansiedade Leve", students: ["Kathleen Victoria Batista Marques"], advisor: "Jacqueline Soares Carvalho Correia", coadvisor: "Yan Pablo Moreira Xavier", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 11 },
    { code: "10MDCBS", cat: "saude", level: "Ensino Médio", title: "Infinite Recombination Genome", students: ["Luiz Felipe da Costa Castilho", "Romulo dos Santos Pereira", "Rodrigo Augusto de Oliveira Nunes"], advisor: "Jonierson de Araújo da Cruz", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 96 },
    { code: "11MDCBS", cat: "saude", level: "Ensino Médio", title: "Projeto Id-Dengue: Aplicativo de Triagem e Avaliação de Gravidade Baseado em Inteligência Artificial para Otimização do Fluxo de Atendimento no Sus", students: ["Miguel Miranda Batista"], advisor: "Hebert Lima Batista", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 86 },
    { code: "01MDEXT", cat: "exatas", level: "Ensino Médio", title: "Idoso Conectado: Plataforma Digital Acessível com Assistente por Voz para Promoção da Autonomia e Inclusão Digital de Pessoas Idosas", students: ["Samyra Souza Araújo", "Isabelle Carvalho Moura", "Maria Isabella Fonseca Pereira"], advisor: "Ana Paula Moreira Ahmad Amorim", coadvisor: "Joao Vitor Silva Carvalho Costa", school: "Centro de Ensino Graça Aranha", city: "Imperatriz – MA", votes: 31 },
    { code: "02MDEXT", cat: "exatas", level: "Ensino Médio", title: "Rastreador Astronômico Automatizado: um sistema de baixo custo para localização de corpos celestes", students: ["Kalliny Gomes"], advisor: "Jonierson de Araújo da Cruz", school: "IFTO — Campus Paraíso", city: "Paraíso – TO", votes: 59 },
    { code: "03MDEXT", cat: "exatas", level: "Ensino Médio", title: "IFísica: Site Desenvolvido Para Auxiliar na Aprendizagem", students: ["Maria Eduarda Stelare Caitano", "Aira Pereira Sabóia", "Rafaella Borges Simão Santana"], advisor: "Leonardo de Sousa Silva", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 98 },
    { code: "04MDEXT", cat: "exatas", level: "Ensino Médio", title: "Locapet, Uma Solução Moderna para Localização de Animais Perdidos", students: ["Jhuan Custodio da Silva", "Henrique Haquinen de Sousa Batista Junior"], advisor: "Christopher Rodrigues Vieira", school: "Centro de Ensino Médio Paulo Freire", city: "Araguaína – TO", votes: 49 },
    { code: "05MDEXT", cat: "exatas", level: "Ensino Médio", title: "Comunica Mais: Um Aplicativo Web Para Comunicação entre Falantes e Não Falantes de Libras", students: ["Davi Souza Andraschko", "Yohana de Sousa Lopes Meira"], advisor: "Gabriel Almeida da Silva", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 172 },
    { code: "06MDEXT", cat: "exatas", level: "Ensino Médio", title: "BRAWL QUEST 2.0: Jogo Digital Gamificado para Evolução Física e Mental Através de Escaneamento de Movimentos", students: ["Ily Vitória da Luz Soares"], advisor: "Jonierson de Araújo da Cruz", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 49 },
    { code: "07MDEXT", cat: "exatas", level: "Ensino Médio", title: "Amigo Digital: Plataforma Web Acessível para Segurança e Inclusão Digital de Pessoas Idosas", students: ["Eyshilla Ramylle Oliveira da Silva", "Sérgio Henrique Freitas Alves", "Lívia Ewenllyn Simplicio Silva"], advisor: "Ana Paula Moreira Ahmad Amorim", coadvisor: "Joao Vitor Silva Carvalho Costa", school: "Centro de Ensino Graça Aranha", city: "Imperatriz – MA", votes: 57 },
    { code: "08MDEXT", cat: "exatas", level: "Ensino Médio", title: "NeuroBanco: Repositório de Padrões Neurais para o Monitoramento e Diagnóstico de Crises", students: ["Jorge Davi Guedes Cavalcante"], advisor: "Walisson Pereira de Sousa", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 51 },
    { code: "09MDEXT", cat: "exatas", level: "Ensino Médio", title: "Mural Digital Inteligente e Interativo: Plataforma de Sinalização Dinâmica e Gestão Local para Comunicação Acadêmica", students: ["Ybson Coelho Alves da Silva", "Sara Marllyne Santana Silva", "Samuel Vieira de Souza"], advisor: "Laercio Pontin Junior", coadvisor: "Haroldo Júnior Bezerra da Silva", school: "IFTO — Campus Colinas", city: "Colinas – TO", votes: 42 },
    { code: "01MDEEA", cat: "ambiental", level: "Ensino Médio", title: "BIONATUS - Bioconversão de Resíduos Orgânicos em Bioinsumo e Avaliação de Seus Efeitos Sobre o Desenvolvimento Inicial de Hortaliças", students: ["Alice Arrais Resende", "Ana Clara Brito Santana"], advisor: "Hebert Lima Batista", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 40 },
    { code: "02MDEEA", cat: "ambiental", level: "Ensino Médio", title: "Revival HydroSeeding- II: sistema de hidrossemeadura para recuperação de solos degradados", students: ["Arthur Rocha Rodrigues de Melo", "Valentina Vasconcelos Rosado"], advisor: "Hebert Lima Batista", coadvisor: "Vagner Alves dos Santos", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 30 },
    { code: "03MDEEA", cat: "ambiental", level: "Ensino Médio", title: "Desidratador com Controle Automatizado de Variáveis Térmicas e de Fluxo de Ar para Pequenos Produtores Rurais", students: ["Samuel Leal Mendes"], advisor: "Jonierson de Araújo da Cruz", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 0 },
    { code: "04MDEEA", cat: "ambiental", level: "Ensino Médio", title: "Desenvolvimento de Chocolate Enriquecido com Farinha de Coproduto do Processamento de Caju", students: ["Heloise Fernandes Marin Magalhães", "Pedro Gabriel Mendes Ricarto", "Thays Eulynna Ferreira Brandão"], advisor: "José Dilson Francisco da Silva", coadvisor: "Yan Pablo Moreira Xavier", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 62 },
    { code: "05MDEEA", cat: "ambiental", level: "Ensino Médio", title: "Mapeamento dos Dados Altimétricos de Babaçulândia-TO, no Processo de Análise de Áreas de Enchentes e Inundações como Ferramenta no Planejamento Urbano, Ambiental e de Contenção de Impactos Ambientais", students: ["Marcio Junior Martins Pimentel", "Lara Vitoria Alves Silva", "Thays Helena Rodrigues Silva"], advisor: "Luiz Carlos Junio Magno Dias dos Santos", coadvisor: "Antonio Lucas Milhomem da Silva", school: "Escola Estadual Leopoldo de Bulhões", city: "Babaçulândia – TO", votes: 43 },
    { code: "06MDEEA", cat: "ambiental", level: "Ensino Médio", title: "Mapeamento e Análise do Uso do Solo no Município de Babaçulândia-TO, Através do Recorte Pré e Pós Chegada da Usina Hidrelétrica de Estreito (Uhe)", students: ["Ana Clara Silva Brito", "Renato Nogueira Alves Filho", "Ramza Catharina Barros Souza"], advisor: "Luiz Carlos Junio Magno Dias dos Santos", coadvisor: "Socorro Manoela de Brito Gomes", school: "Escola Estadual Leopoldo de Bulhões", city: "Babaçulândia – TO", votes: 8 },
    { code: "07MDEEA", cat: "ambiental", level: "Ensino Médio", title: "Miniestufa Automatizada para Germinação de Sementes", students: ["Walter Arthur Rocha Lima", "Marcos Welb Veloso de Andrade"], advisor: "Jonierson de Araújo da Cruz", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 0 },
    { code: "08MDEEA", cat: "ambiental", level: "Ensino Médio", title: "Produção de biocarvão a partir de resíduos alimentares escolares e produção de fertilizante", students: ["Yasmin Andrade dos Santos", "Enzo Estevam Meneses Diniz", "Thiago Andrade Souza"], advisor: "Jefferson Santana da Silva Carneiro", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 38 },
    { code: "09MDEEA", cat: "ambiental", level: "Ensino Médio", title: "Isolamento e Seleção de Rizóbios Nativos Eficientes na Promoção do Crescimento do Feijão-Caupi no Tocantins", students: ["Nathalia Coelho Marques", "Tevis Campos Cardoso", "Yasmim Lima Sena"], advisor: "Cleudison Gabriel Nascimento da Silva", school: "IFTO — Campus Colinas", city: "Colinas – TO", votes: 41 },
    { code: "10MDEEA", cat: "ambiental", level: "Ensino Médio", title: "Do papel ao QR Code: quanto um cardápio digital pode reduzir custos e impactos ambientais?", students: ["Júlia Santos de Oliveira", "João Gabriel Nunes de Araújo Couto Moreira", "Heloise Gonzaga de Miranda"], advisor: "Aparecida Barbosa de Paiva", school: "IFTO — Campus Colinas", city: "Colinas – TO", votes: 47 },
    { code: "11MDEEA", cat: "ambiental", level: "Ensino Médio", title: "Sonda 2D Modular Intertravada: Monitoramento Hídrico Autônomo com Arquitetura de Sacrifício", students: ["Samuel Orione Santos Lima"], advisor: "Alexandre Cotrim Vilas Boas", coadvisor: "Jainara Nunes da Silva", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 14 },
    { code: "01MDEEM", cat: "engenharias", level: "Ensino Médio", title: "VisionAI – Desenvolvimento de um Sistema Assistivo Integrado com Óculos Inteligentes e Bengala para Reconhecimento de Objetos e Detecção de Obstáculos", students: ["Esther Arruda Luz Rodrigues", "Emerson Dias Marinho Júnior", "Mariana Generosa e Silva"], advisor: "Marcelo Rodrigues Barbosa", school: "Colégio Santa Cruz", city: "Araguaína – TO", votes: 26 },
    { code: "02MDEEM", cat: "engenharias", level: "Ensino Médio", title: "Abrindo portas: Desenvolvimento de um dispositivo de acionamento de trincos por pedal para prevenção de contaminações cruzadas", students: ["Clara Reis", "Paulo Ricardo Tavares Ferreira", "Pedro Augusto Carneiro Gonçalves"], advisor: "Clerson Dalvani Reis", school: "IFTO — Campus Palmas", city: "Palmas – TO", votes: 34 },
    { code: "03MDEEM", cat: "engenharias", level: "Ensino Médio", title: "Sistema Robótico para Monitoramento Automatizado de Tanques de Piscicultura", students: ["João Gabriel Costa de Almeida", "Lucas Pinheiro de Souza Figueira"], advisor: "Jonierson de Araújo da Cruz", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 27 },
    { code: "04MDEEM", cat: "engenharias", level: "Ensino Médio", title: "Dispositivo Flutuante Inteligente para Monitoramento de Movimentos e Prevenção de Afogamentos", students: ["André Felipe Sales de Castro", "João Arthur Lopes Pedrosa"], advisor: "Jonierson de Araújo da Cruz", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 4 },
    { code: "05MDEEM", cat: "engenharias", level: "Ensino Médio", title: "Robô Móvel para Entrega Autônoma de Medicamentos e alimentação", students: ["Isaac Barbosa Guimarães Lima", "Ezequiel Andrade Gomes", "Artur Lopes dos Santos"], advisor: "Jonierson de Araújo da Cruz", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 46 },
    { code: "06MDEEM", cat: "engenharias", level: "Ensino Médio", title: "ApisSense: Dispositivo de Monitoramento Remoto de Colmeias com Arquitetura Eletrônica", students: ["Thayna Ibiapino Rodrigues"], advisor: "Hebert Lima Batista", coadvisor: "Jonierson de Araújo da Cruz", school: "IFTO — Campus Araguaína", city: "Araguaína – TO", votes: 35 }
  ];

  var catById = {};
  CATEGORIES.forEach(function (c) { catById[c.id] = c; });

  function norm(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }


  PROJECTS.forEach(function (p) {
    p.slug = p.code.toLowerCase();
    p.id = p.slug;
    p.hay = norm([p.code, p.title, p.students.join(' '), p.advisor, p.coadvisor || '', p.school, p.city, p.level, catById[p.cat].name].join(' '));
  });

  var byId = {};
  PROJECTS.forEach(function (p) { byId[p.id] = p; });

  /* ─── Estado ───────────────────────────────────────────── */
  var state = {
    phaseMode: store.get('vt_phase', 'aberta'),
    live: store.get('vt_live', true),
    user: store.get('vt_user', null),
    myVote: store.get('vt_vote', null),
    tab: 'geral',
    q: '',
    pending: null,
    lastUpdate: Date.now(),
    prevIdx: null,        // ordem anterior (para setas ▲▼)
    prevKey: '',          // aba+busca a que prevIdx se refere
    prevVotes: {},
    leaderKey: '',
    hold: false,          // usuário mirando um botão: não reordenar
    dirty: false          // há atualização pendente por causa do hold
  };

  if (state.myVote && byId[state.myVote]) byId[state.myVote].votes += 1;
  else state.myVote = null;

  function phase() {
    if (state.phaseMode !== 'auto') return state.phaseMode;
    var now = Date.now();
    if (now < OPEN_AT.getTime()) return 'antes';
    if (now >= CLOSE_AT.getTime()) return 'encerrada';
    return 'aberta';
  }

  /* ─── Helpers de DOM ───────────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function icon(name, cls) {
    return '<svg class="vt-i' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }

  function fmt(n) { return Number(n).toLocaleString('pt-BR'); }
  function plural(n, one, many) { return n === 1 ? one : many; }

  function catTag(cat) {
    var c = catById[cat];
    return '<span class="vt-cat-tag vt-c-' + c.id + '">' + icon(c.icon) + esc(c.short) + '</span>';
  }

  /* ─── Toasts ───────────────────────────────────────────── */
  var toasts = $('#toasts');
  function toast(msg, type) {
    var el = document.createElement('div');
    el.className = 'vt-toast vt-toast--' + (type || 'success');
    el.innerHTML = icon(type === 'info' ? 'info' : 'check-circle') + '<span>' + msg + '</span>';
    toasts.appendChild(el);
    while (toasts.children.length > 3) toasts.removeChild(toasts.firstChild);
    setTimeout(function () {
      el.classList.add('is-leaving');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 180);
    }, 4200);
  }

  /* ─── URL (deep link de área, busca e projeto) ─────────── */
  function setParam(key, value) {
    try {
      var url = new URL(window.location.href);
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) { /* file:// sem suporte */ }
  }

  function getParam(key) {
    try { return new URL(window.location.href).searchParams.get(key); } catch (e) { return null; }
  }

  /* ─── Navbar ───────────────────────────────────────────── */
  var navbar = $('#navbar');
  var navToggle = $('#navToggle');
  var navLinks = $('#navLinks');

  function onScroll() { navbar.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    navToggle.classList.toggle('active', open);
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  navToggle.addEventListener('click', function () { setMenu(!navLinks.classList.contains('open')); });
  navLinks.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) { setMenu(false); navToggle.focus(); }
  });

  /* ─── Usuário (login simulado) ─────────────────────────── */
  function renderUser() {
    var logged = !!state.user;
    $('#navLogin').hidden = logged;
    $('#navUser').hidden = !logged;
    if (logged) {
      $('#navUserName').textContent = state.user.name;
      $('#navAvatar').textContent = state.user.name.charAt(0).toUpperCase();
    }
  }

  $('#navLogin').addEventListener('click', function () { setMenu(false); openLogin(null); });
  $('#navLogout').addEventListener('click', function () {
    state.user = null;
    store.del('vt_user');
    renderUser();
    renderRanking(false);
    toast('Você saiu da conta. Seu voto continua registrado.', 'info');
  });

  /* ─── Contagem regressiva e fases ──────────────────────── */
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function renderCountdown() {
    var ph = phase();
    var target = ph === 'antes' ? OPEN_AT : CLOSE_AT;
    var closed = ph === 'encerrada';
    $('#cdLabel').textContent = ph === 'antes' ? 'A votação abre em' : (closed ? 'Votação encerrada' : 'A votação encerra em');
    $('#cdGrid').hidden = closed;
    $('#cdClosed').hidden = !closed;
    if (closed) return;
    var d = Math.max(0, target.getTime() - Date.now());
    $('#cdDays').textContent = pad(Math.floor(d / 864e5));
    $('#cdHours').textContent = pad(Math.floor((d % 864e5) / 36e5));
    $('#cdMinutes').textContent = pad(Math.floor((d % 36e5) / 6e4));
    $('#cdSeconds').textContent = pad(Math.floor((d % 6e4) / 1e3));
  }

  var lastPhase = null;
  function renderPhase() {
    var ph = phase();
    document.body.setAttribute('data-phase', ph);
    var label = ph === 'antes' ? 'Em breve' : (ph === 'encerrada' ? 'Resultado final' : 'Ao vivo');
    $('#liveLabel').textContent = label;
    $('#heroLiveLabel').textContent = label;
    $('#rankBadgeLabel').textContent = label;
    renderCountdown();
    if (lastPhase !== null && lastPhase !== ph) {
      renderRanking(false);
      renderBottomBar();
    }
    lastPhase = ph;
  }

  setInterval(function () {
    renderCountdown();
    if (phase() !== lastPhase) renderPhase();
    updateFreshness();
  }, 1000);

  /* ─── Botão de voto (estado por fase e por voto) ───────── */
  function voteButton(p, extraClass) {
    var ph = phase();
    var cls = 'btn-primary vt-btn-sm ' + (extraClass || '');
    var sr = '<span class="vt-sr"> — ' + esc(p.title) + '</span>';
    if (ph === 'antes') return '<button type="button" class="' + cls + '" disabled>' + icon('clock') + 'Abre às 20h' + sr + '</button>';
    if (ph === 'encerrada') return '<button type="button" class="' + cls + '" disabled>Encerrada' + sr + '</button>';
    if (state.myVote === p.id) return '<button type="button" class="' + cls + ' is-mine" disabled>' + icon('check') + 'Seu voto' + sr + '</button>';
    if (state.myVote) return '<button type="button" class="' + cls + '" disabled>Já votou' + sr + '</button>';
    return '<button type="button" class="' + cls + '" data-action="vote" data-id="' + p.id + '">' + icon('thumbs-up') +
      'Votar<span class="vt-sr"> em ' + esc(p.title) + '</span></button>';
  }

  function nameButton(p) {
    return '<button type="button" class="vt-name-btn" data-action="details" data-id="' + p.id + '">' + esc(p.title) + '</button>';
  }

  /* ─── Ranking: todos os projetos, ranking denso ────────── */
  var rankBody = $('#rankBody');
  var podium = $('#podium');
  var rankList = $('#rankList');
  var rankEmpty = $('#rankEmpty');
  var rankNote = $('#rankNote');
  var rankNotice = $('#rankNotice');
  var rankTabs = $('#rankTabs');
  var results = $('#results');
  var searchInput = $('#searchInput');
  var searchClear = $('#searchClear');

  /* Ordena por votos (desc). Não há posições compartilhadas: com o mesmo
     número de votos, o desempate é a ordem alfabética do nome do projeto.
     Projetos sem votos ficam no fim, sem posição. Antes da abertura, a
     lista fica em ordem alfabética, sem posições. */
  function computeRanking(tab) {
    var list = PROJECTS.filter(function (p) { return tab === 'geral' || p.cat === tab; });
    var before = phase() === 'antes';
    list.sort(function (a, b) {
      if (before) return a.title.localeCompare(b.title, 'pt-BR');
      return b.votes - a.votes || a.title.localeCompare(b.title, 'pt-BR');
    });
    var pos = 0;
    var rows = list.map(function (p, i) {
      var r = { p: p, idx: i, pos: null };
      if (!before && p.votes > 0) { pos += 1; r.pos = pos; }
      return r;
    });
    return rows;
  }

  function renderTabs() {
    var tabs = [{ id: 'geral', short: 'Todas', icon: 'award' }].concat(CATEGORIES);
    rankTabs.innerHTML = tabs.map(function (t) {
      var sel = state.tab === t.id;
      var n = t.id === 'geral' ? PROJECTS.length : PROJECTS.filter(function (p) { return p.cat === t.id; }).length;
      return '<button type="button" role="tab" class="vt-tab' + (t.id !== 'geral' ? ' vt-c-' + t.id : '') + '" id="tab-' + t.id + '"' +
        ' data-tab="' + t.id + '" aria-selected="' + sel + '" aria-controls="rankBody" tabindex="' + (sel ? '0' : '-1') + '">' +
        icon(t.icon) + esc(t.short) + ' <span class="vt-chip-count">' + n + '</span></button>';
    }).join('');
  }

  rankTabs.addEventListener('click', function (e) {
    var b = e.target.closest('[role="tab"]');
    if (b) selectTab(b.dataset.tab, false);
  });

  rankTabs.addEventListener('keydown', function (e) {
    var keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (keys.indexOf(e.key) === -1) return;
    e.preventDefault();
    var tabs = $all('[role="tab"]', rankTabs);
    var i = tabs.indexOf(document.activeElement);
    if (e.key === 'ArrowRight') i = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') i = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') i = 0;
    if (e.key === 'End') i = tabs.length - 1;
    selectTab(tabs[i].dataset.tab, true);
  });

  function selectTab(id, focus) {
    state.tab = id;
    $all('[role="tab"]', rankTabs).forEach(function (t) {
      var sel = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(sel));
      t.tabIndex = sel ? 0 : -1;
      if (sel && focus) t.focus();
    });
    rankBody.setAttribute('aria-labelledby', 'tab-' + id);
    setParam('area', id === 'geral' ? null : id);
    renderRanking(false);
  }

  /* Busca */
  var searchTimer;
  searchInput.addEventListener('input', function () {
    searchClear.hidden = !searchInput.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.q = searchInput.value;
      setParam('q', state.q.trim() || null);
      renderRanking(false);
    }, 160);
  });

  function clearSearch(focus) {
    searchInput.value = '';
    searchClear.hidden = true;
    state.q = '';
    setParam('q', null);
    if (focus) searchInput.focus();
  }

  searchClear.addEventListener('click', function () { clearSearch(true); renderRanking(false); });
  $('#emptyReset').addEventListener('click', function () { clearSearch(true); selectTab('geral', false); });

  /* Variação pela ordem relativa (ultrapassagens) entre snapshots. */
  function variation(r, prev) {
    var none = { cls: '', html: icon('minus') + '<span class="vt-sr">sem mudança</span>' };
    if (!prev || !r.pos) return none;
    var before = prev[r.p.id];
    if (before === undefined) return none;
    if (before > r.idx) return { cls: 'is-up', up: true, html: icon('arrow-up') + '<span>' + (before - r.idx) + '</span><span class="vt-sr"> ultrapassou ' + (before - r.idx) + '</span>' };
    if (before < r.idx) return { cls: 'is-down', html: icon('arrow-down') + '<span>' + (r.idx - before) + '</span><span class="vt-sr"> foi ultrapassado por ' + (r.idx - before) + '</span>' };
    return none;
  }

  function levelTag(p) {
    return '<span class="vt-mini-badge vt-level-badge" title="' + esc(p.level) + '">' + esc(LEVEL_SHORT[p.level] || p.level) + '</span>';
  }

  function badges(r) {
    var html = levelTag(r.p);
    if (state.myVote === r.p.id) html += '<span class="vt-mini-badge vt-mini-badge--mine">' + icon('check') + 'Seu voto</span>';
    return html;
  }

  /* Só o primeiro nome de cada autor, unidos em português ("Ana, Pedro e Júlia") */
  function firstName(full) { return String(full).trim().split(/\s+/)[0]; }

  function joinNames(names) {
    if (names.length <= 1) return names.join('');
    return names.slice(0, -1).join(', ') + ' e ' + names[names.length - 1];
  }

  function podiumPeople(p) {
    var students = joinNames(p.students.slice(0, 3).map(firstName));
    return '<ul class="vt-podium-people">' +
      '<li>' + icon('users') + '<span><span class="vt-sr">Alunos: </span>' + esc(students) + '</span></li>' +
      (p.advisor ? '<li>' + icon('user') + '<span>Orientação: ' + esc(firstName(p.advisor)) + '</span></li>' : '') +
      '<li>' + icon('home') + '<span><span class="vt-sr">Escola: </span>' + esc(p.school) + '</span></li>' +
    '</ul>';
  }

  function podiumCard(r, prev) {
    var mine = state.myVote === r.p.id;
    var v = variation(r, prev);
    return '<article class="vt-podium-card' + (mine ? ' is-mine' : '') + (v.up ? ' vt-glow' : '') + '" data-flip-id="' + r.p.id + '">' +
      '<span class="vt-podium-medal">' + icon('award') + r.pos + 'º lugar</span>' +
      '<h3 class="vt-podium-name">' + nameButton(r.p) + '</h3>' +
      '<div class="vt-badges-row">' + catTag(r.p.cat) + badges(r) + '</div>' +
      podiumPeople(r.p) +
      '<p class="vt-podium-votes"><b data-count="' + r.p.id + '">' + fmt(r.p.votes) + '</b>' + plural(r.p.votes, 'voto', 'votos') + '</p>' +
      '<div class="vt-podium-actions">' + voteButton(r.p) + '</div>' +
    '</article>';
  }

  function rowHTML(r, prev, leader) {
    var p = r.p;
    var mine = state.myVote === p.id;
    var v = variation(r, prev);
    var pct = leader ? Math.round((p.votes / leader) * 100) : 0;
    return '<li class="vt-rank-row' + (mine ? ' is-mine' : '') + (r.pos ? '' : ' is-zero') + (v.up ? ' vt-glow' : '') + '" data-flip-id="' + p.id + '">' +
      '<span class="vt-rank-pos">' + (r.pos ? r.pos + 'º<span class="vt-sr"> lugar</span>' : '–<span class="vt-sr">sem posição</span>') + '</span>' +
      '<span class="vt-rank-var ' + v.cls + '">' + v.html + '</span>' +
      '<div class="vt-rank-main">' + nameButton(p) +
        '<div class="vt-badges-row">' + catTag(p.cat) + badges(r) + '</div></div>' +
      '<div class="vt-rank-bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div>' +
      '<span class="vt-rank-votes"><b data-count="' + p.id + '">' + fmt(p.votes) + '</b>' + plural(p.votes, 'voto', 'votos') + '</span>' +
      '<div class="vt-rank-action">' + voteButton(p) + '</div>' +
    '</li>';
  }

  function renderNotice(ph) {
    if (ph === 'aberta') { rankNotice.hidden = true; return; }
    var html;
    if (ph === 'antes') {
      html = '<span class="vt-notice-icon">' + icon('clock') + '</span>' +
        '<p class="vt-notice-text"><strong>A votação abre em 24/11 às 20h</strong>' +
        '<span>Conheça os projetos abaixo. Entre com o Google agora e, na abertura, é só tocar em Votar.</span></p>' +
        (state.user ? '' : '<button type="button" class="btn-primary vt-btn-sm" data-notice-login>' + icon('log-in') + 'Entrar com Google</button>');
    } else {
      html = '<span class="vt-notice-icon">' + icon('award') + '</span>' +
        '<p class="vt-notice-text"><strong>Votação encerrada</strong>' +
        '<span>Este é o resultado final da votação popular, encerrada em 26/11 às 12h. O anúncio oficial acontece na premiação.</span></p>';
    }
    rankNotice.innerHTML = html;
    rankNotice.hidden = false;
  }

  rankNotice.addEventListener('click', function (e) {
    if (e.target.closest('[data-notice-login]')) openLogin(null);
  });

  /* Guarda qual botão estava focado para devolver o foco após re-render */
  function focusMarker() {
    var a = document.activeElement;
    if (!a || !rankBody.contains(a) || !a.dataset) return null;
    return a.dataset.action && a.dataset.id ? { action: a.dataset.action, id: a.dataset.id } : null;
  }

  function restoreFocus(m) {
    if (!m) return;
    var el = rankBody.querySelector('[data-action="' + m.action + '"][data-id="' + m.id + '"]');
    if (el) el.focus({ preventScroll: true });
  }

  function renderRanking(animate) {
    var ph = phase();
    var total = PROJECTS.reduce(function (s, p) { return s + p.votes; }, 0);
    state.dirty = false;

    if (ph === 'antes') {
      $('#liveTotal').textContent = '0';
      $('#heroTotal').textContent = 'Abre 24/11, 20h';
    } else {
      animateNumber($('#liveTotal'), total, animate);
      $('#heroTotal').textContent = fmt(total) + ' ' + plural(total, 'voto', 'votos');
    }

    renderNotice(ph);

    var all = computeRanking(state.tab);
    var q = norm(state.q.trim());
    var searching = q.length > 0;
    var leader = all.length && all[0].pos ? all[0].p.votes : 0;

    var key = state.tab + '|' + q + '|' + ph;
    var prev = state.prevKey === key ? state.prevIdx : null;
    var marker = focusMarker();
    var flipState = (animate && prev && hasFlip && !reduceMotion) ? Flip.getState('#rankBody [data-flip-id]') : null;

    /* Pódio: 1º, 2º e 3º, um projeto por degrau. Some durante a busca. */
    var showPodium = ph !== 'antes' && !searching && leader > 0;
    if (showPodium) {
      var steps = '';
      [1, 2, 3].forEach(function (n) {
        var items = all.filter(function (r) { return r.pos === n; });
        steps += '<div class="vt-step vt-step-' + n + '"><div class="vt-step-items">' +
          (items.length ? items.map(function (r) { return podiumCard(r, prev); }).join('')
            : '<div class="vt-podium-empty">' + n + 'º lugar ainda sem projeto</div>') +
          '</div><div class="vt-step-base" aria-hidden="true">' + n + 'º</div></div>';
      });
      podium.innerHTML = steps;
      podium.hidden = false;
    } else {
      podium.innerHTML = '';
      podium.hidden = true;
    }

    /* Lista: todos os projetos (sem os do pódio, exceto durante a busca) */
    var rows = all.filter(function (r) {
      if (searching) return r.p.hay.indexOf(q) !== -1;
      return !(showPodium && r.pos && r.pos <= 3);
    });
    rankList.innerHTML = rows.map(function (r) { return rowHTML(r, prev, leader); }).join('');

    var areaTxt = state.tab === 'geral' ? 'em todas as áreas' : 'em ' + catById[state.tab].name;
    if (searching) {
      results.innerHTML = '<strong>' + rows.length + ' ' + plural(rows.length, 'resultado', 'resultados') + '</strong> para “' +
        esc(state.q.trim()) + '” ' + areaTxt;
    } else {
      results.innerHTML = '<strong>' + all.length + ' ' + plural(all.length, 'projeto', 'projetos') + '</strong> ' + areaTxt +
        (showPodium ? ' · demais posições abaixo do pódio' : (ph === 'antes' ? ' · em ordem alfabética até a abertura' : ''));
    }

    rankEmpty.hidden = !(searching && rows.length === 0);
    if (!rankEmpty.hidden) $('#emptyTitle').textContent = 'Nenhum projeto encontrado para “' + state.q.trim() + '”';
    $('.vt-rank-head').hidden = rows.length === 0;
    rankNote.hidden = ph === 'antes';

    if (flipState) {
      Flip.from(flipState, {
        targets: '#rankBody [data-flip-id]',
        duration: 0.6,
        ease: 'power2.inOut',
        onEnter: function (els) { return gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.3 }); }
      });
    }

    /* Contagem animada dos votos que mudaram */
    if (animate) {
      $all('[data-count]', rankBody).forEach(function (el) {
        var id = el.getAttribute('data-count');
        var before = state.prevVotes[id];
        if (before !== undefined && before !== byId[id].votes) animateFrom(el, before, byId[id].votes);
      });
    }

    /* Anúncio de troca de líder (leitor de tela) */
    var leaders = all.filter(function (r) { return r.pos === 1; }).map(function (r) { return r.p.title; });
    var lk = state.tab + ':' + leaders.join('|');
    if (prev && state.leaderKey && lk !== state.leaderKey && state.leaderKey.split(':')[0] === state.tab && leaders.length) {
      $('#rankAnnouncer').textContent = 'Novo líder: ' + leaders.join(' e ') + '.';
    }
    state.leaderKey = lk;

    var map = {};
    all.forEach(function (r) { map[r.p.id] = r.idx; });
    state.prevIdx = map;
    state.prevKey = key;
    PROJECTS.forEach(function (p) { state.prevVotes[p.id] = p.votes; });

    restoreFocus(marker);
  }

  rankBody.addEventListener('click', function (e) {
    var b = e.target.closest('[data-action]');
    if (!b) return;
    if (b.dataset.action === 'details') openDetail(b.dataset.id);
    if (b.dataset.action === 'vote') requestVote(b.dataset.id);
  });

  /* Não reordenar a lista enquanto o usuário mira um botão:
     a atualização fica pendente e entra assim que ele sai. */
  function setHold(on) {
    if (state.hold === on) return;
    state.hold = on;
    if (!on && state.dirty) renderRanking(true);
  }

  rankBody.addEventListener('pointerover', function (e) {
    setHold(!!e.target.closest('[data-action]'));
  });
  rankBody.addEventListener('pointerleave', function () { setHold(false); });
  rankBody.addEventListener('focusin', function (e) { if (e.target.closest('[data-action]')) setHold(true); });
  rankBody.addEventListener('focusout', function (e) {
    if (!e.relatedTarget || !rankBody.contains(e.relatedTarget)) setHold(false);
  });

  function animateFrom(el, from, to) {
    if (!hasGsap || reduceMotion) { el.textContent = fmt(to); return; }
    var o = { v: from };
    gsap.to(o, { v: to, duration: 0.6, ease: 'power1.out', onUpdate: function () { el.textContent = fmt(Math.round(o.v)); } });
  }

  function animateNumber(el, to, animate) {
    var from = parseInt(String(el.textContent).replace(/\D/g, ''), 10);
    if (animate && !isNaN(from) && from !== to) animateFrom(el, from, to);
    else el.textContent = fmt(to);
  }

  function updateFreshness() {
    var el = $('#liveUpdated');
    var ph = phase();
    if (ph === 'antes') { el.textContent = 'abre 24/11 às 20h'; return; }
    if (ph === 'encerrada') { el.textContent = 'encerrada em 26/11 às 12h'; return; }
    if (!state.live) { el.textContent = 'simulação pausada'; return; }
    if (state.dirty) { el.textContent = 'novos votos chegando…'; return; }
    var s = Math.round((Date.now() - state.lastUpdate) / 1000);
    el.textContent = s < 3 ? 'atualizado agora' : 'atualizado há ' + s + 's';
  }

  /* ─── Simulação de votos chegando (substitui o Reverb) ─── */
  setInterval(function () {
    if (document.hidden || !state.live || phase() !== 'aberta') return;
    var n = 1 + Math.floor(Math.random() * 3);
    for (var k = 0; k < n; k++) {
      var weights = PROJECTS.map(function (p) { return p.votes + 30; });
      var sum = weights.reduce(function (a, b) { return a + b; }, 0);
      var r = Math.random() * sum;
      for (var i = 0; i < PROJECTS.length; i++) {
        r -= weights[i];
        if (r <= 0) { PROJECTS[i].votes += 1; break; }
      }
    }
    state.lastUpdate = Date.now();
    if (state.hold || activeModal) { state.dirty = true; }
    else renderRanking(true);
    updateFreshness();
  }, SNAPSHOT_MS);

  /* ─── Modais ───────────────────────────────────────────── */
  var activeModal = null;
  var returnFocus = null;
  var returnMarker = null;

  function focusables(root) {
    return $all('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
      .filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }

  function openModal(id) {
    var m = document.getElementById(id);
    if (activeModal) closeModal(true, true);
    else {
      returnFocus = document.activeElement;
      returnMarker = focusMarker();
    }
    m.hidden = false;
    m.classList.remove('is-closing');
    document.body.classList.add('vt-lock');
    void m.offsetWidth;
    m.classList.add('is-open');
    activeModal = m;
    var target = m.querySelector('[data-autofocus]') || m.querySelector('.vt-modal-dialog');
    setTimeout(function () { target.focus(); }, 40);
  }

  function closeModal(instant, keepFocus) {
    var m = activeModal;
    if (!m) return;
    activeModal = null;
    m.classList.remove('is-open');
    m.classList.add('is-closing');
    var done = function () {
      m.hidden = true;
      m.classList.remove('is-closing');
      if (!activeModal) document.body.classList.remove('vt-lock');
    };
    if (instant || reduceMotion) done(); else setTimeout(done, 160);
    if (m.id === 'modalDetail') setParam('projeto', null);
    if (!keepFocus) {
      if (state.dirty) renderRanking(false);
      if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
      else if (returnMarker) {
        var el = rankBody.querySelector('[data-action="' + returnMarker.action + '"][data-id="' + returnMarker.id + '"]') ||
          rankBody.querySelector('[data-action="details"][data-id="' + returnMarker.id + '"]');
        if (el) el.focus();
      }
    }
  }

  document.addEventListener('click', function (e) {
    if (activeModal && e.target.closest('[data-close]') && activeModal.contains(e.target)) {
      var link = e.target.closest('a[href^="#"]');
      closeModal(false, !!link);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!activeModal) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key === 'Tab') {
      var f = focusables(activeModal);
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === activeModal.querySelector('.vt-modal-dialog'))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  /* Detalhes */
  function openDetail(id) {
    var p = byId[id];
    if (!p) return;
    var c = catById[p.cat];
    var ph = phase();
    var hint = ph === 'aberta' && !state.myVote
      ? 'Cada pessoa vota uma única vez.'
      : (state.myVote === p.id ? 'Você votou neste projeto.' : '');
    $('#detailContent').innerHTML =
      '<div class="vt-detail-hero vt-area-' + c.id + '">' + icon(c.icon) + '<span class="project-tag">' + esc(c.name) + '</span></div>' +
      '<div class="vt-detail-body">' +
        '<h2 id="detailTitle">' + esc(p.title) + '</h2>' +
        (p.summary ? '<p>' + esc(p.summary) + '</p>' : '') +
        '<dl class="vt-detail-facts">' +
          '<div class="vt-span-2"><dt>Alunos</dt><dd><ul class="vt-student-list">' +
            p.students.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></dd></div>' +
          (p.advisor ? '<div class="vt-span-2"><dt>Orientação</dt><dd>' + esc(p.advisor) + '</dd></div>' : '') +
          (p.coadvisor ? '<div class="vt-span-2"><dt>Coorientação</dt><dd>' + esc(p.coadvisor) + '</dd></div>' : '') +
          '<div class="vt-span-2"><dt>Escola</dt><dd>' + esc(p.school) + '</dd></div>' +
          '<div><dt>Cidade</dt><dd>' + esc(p.city) + '</dd></div>' +
          '<div><dt>Nível</dt><dd>' + esc(p.level) + '</dd></div>' +
          '<div><dt>Área</dt><dd>' + esc(c.name) + '</dd></div>' +
          '<div><dt>Código</dt><dd>' + esc(p.code) + '</dd></div>' +
        '</dl>' +
        '<div class="vt-detail-cta">' + voteButton(p).replace('data-action="vote"', 'data-detail-vote').replace(' vt-btn-sm', '') +
          (hint ? '<p>' + hint + '</p>' : '') + '</div>' +
      '</div>';
    setParam('projeto', p.slug);
    openModal('modalDetail');
  }

  $('#detailContent').addEventListener('click', function (e) {
    var b = e.target.closest('[data-detail-vote]');
    if (b) requestVote(b.dataset.id);
  });

  /* Login */
  function openLogin(pendingId) {
    state.pending = pendingId;
    var btn = $('#googleBtn');
    btn.classList.remove('is-loading');
    $('#googleBtnLabel').textContent = 'Entrar com Google';
    $('#loginPending').textContent = pendingId
      ? 'Depois de entrar, você volta direto para confirmar o voto em “' + byId[pendingId].title + '”.'
      : (phase() === 'antes' ? 'Entre agora e, às 20h do dia 24, é só tocar e confirmar.' : '');
    openModal('modalLogin');
  }

  $('#googleBtn').addEventListener('click', function () {
    var btn = this;
    if (btn.classList.contains('is-loading')) return;
    btn.classList.add('is-loading');
    btn.insertAdjacentHTML('afterbegin', '<span class="vt-spinner" aria-hidden="true"></span>');
    $('#googleBtnLabel').textContent = 'Conectando ao Google…';
    setTimeout(function () {
      var sp = btn.querySelector('.vt-spinner');
      if (sp) sp.remove();
      state.user = { name: 'Visitante', email: 'visitante@exemplo.com' };
      store.set('vt_user', state.user);
      renderUser();
      renderNotice(phase());
      toast('Login simulado concluído. Olá, ' + state.user.name + '!');
      var id = state.pending;
      state.pending = null;
      if (id && phase() === 'aberta' && !state.myVote) openConfirm(id);
      else closeModal();
    }, 900);
  });

  /* Confirmação */
  var turnstileTimer;
  function openConfirm(id) {
    var p = byId[id];
    var c = catById[p.cat];
    state.pending = id;
    $('#confirmProject').innerHTML =
      '<span class="vt-confirm-thumb vt-area-' + c.id + '">' + icon(c.icon) + '</span>' +
      '<div><strong>' + esc(p.title) + '</strong>' + catTag(p.cat) + '</div>';
    var ts = $('#turnstile');
    var btn = $('#confirmBtn');
    ts.setAttribute('data-state', 'checking');
    $('#turnstileText').textContent = 'Verificando se você não é um robô…';
    btn.disabled = true;
    btn.classList.remove('is-loading');
    $('.vt-btn-label', btn).textContent = 'Confirmar voto';
    clearTimeout(turnstileTimer);
    turnstileTimer = setTimeout(function () {
      ts.setAttribute('data-state', 'ok');
      $('#turnstileText').textContent = 'Verificação concluída';
      btn.disabled = false;
    }, 700);
    openModal('modalConfirm');
  }

  $('#confirmBtn').addEventListener('click', function () {
    var btn = this;
    var id = state.pending;
    if (!id || btn.classList.contains('is-loading')) return;
    btn.classList.add('is-loading');
    btn.disabled = true;
    $('.vt-btn-label', btn).textContent = 'Registrando…';
    setTimeout(function () {
      if (state.myVote) {
        closeModal();
        toast('Você já votou em “' + byId[state.myVote].title + '”.', 'info');
        return;
      }
      if (phase() !== 'aberta') {
        closeModal();
        toast('A votação não está aberta. Seu voto não foi registrado.', 'info');
        return;
      }
      state.myVote = id;
      state.pending = null;
      byId[id].votes += 1;
      store.set('vt_vote', id);
      state.lastUpdate = Date.now();
      openSuccess(byId[id]);
      renderRanking(false);
      renderBottomBar();
    }, 900);
  });

  /* Sucesso */
  function openSuccess(p) {
    var img = $('#successMascot');
    if (!img.getAttribute('src')) img.setAttribute('src', img.getAttribute('data-src'));
    $('#successDesc').innerHTML = 'Seu voto em <strong>' + esc(p.title) + '</strong> foi computado. Obrigado por apoiar a ciência feita no Tocantins!';
    var base = window.location.href.split('?')[0].split('#')[0];
    var text = 'Votei no projeto "' + p.title + '" na Votação Popular da VIVA Ciência 2026! Vote também: ' + base + '?projeto=' + p.slug;
    $('#successShare').setAttribute('href', 'https://wa.me/?text=' + encodeURIComponent(text));
    openModal('modalSuccess');
    if (hasGsap && !reduceMotion) {
      gsap.fromTo(img, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)', delay: 0.1 });
    }
  }

  $('#successRanking').addEventListener('click', function () {
    closeModal(false, true);
    clearSearch(false);
    if (state.tab !== 'geral') selectTab('geral', false); else renderRanking(false);
    var target = rankBody.querySelector('.is-mine') || document.getElementById('ranking');
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  /* ─── Fluxo de voto ────────────────────────────────────── */
  function requestVote(id) {
    var p = byId[id];
    if (!p) return;
    var ph = phase();
    if (ph === 'antes') { toast('A votação abre em 24/11 às 20h.', 'info'); return; }
    if (ph === 'encerrada') { toast('A votação foi encerrada em 26/11 ao meio-dia.', 'info'); return; }
    if (state.myVote) {
      toast('Você já votou em “' + byId[state.myVote].title + '”. Cada pessoa vota uma única vez.', 'info');
      return;
    }
    if (!state.user) { openLogin(id); return; }
    openConfirm(id);
  }

  /* ─── Barra inferior (mobile) ──────────────────────────── */
  function renderBottomBar() {
    var text = $('#bottomText');
    var action = $('#bottomAction');
    var ph = phase();
    if (state.myVote) {
      text.innerHTML = icon('check-circle') + '<span>Seu voto: ' + esc(byId[state.myVote].title) + '</span>';
      action.textContent = 'Ver ranking';
    } else if (ph === 'antes') {
      text.innerHTML = icon('clock') + '<span>Votação abre 24/11, 20h</span>';
      action.textContent = 'Ver projetos';
    } else if (ph === 'encerrada') {
      text.innerHTML = icon('award') + '<span>Votação encerrada</span>';
      action.textContent = 'Resultado';
    } else {
      text.innerHTML = icon('thumbs-up') + '<span>Escolha seu projeto favorito</span>';
      action.textContent = 'Votar';
    }
    action.setAttribute('href', '#ranking');
  }

  /* ─── Painel do protótipo ──────────────────────────────── */
  var protoToggle = $('#protoToggle');
  var protoPanel = $('#protoPanel');

  protoToggle.addEventListener('click', function () {
    var open = protoPanel.hidden;
    protoPanel.hidden = !open;
    protoToggle.setAttribute('aria-expanded', String(open));
  });

  $all('input[name="phase"]').forEach(function (r) {
    r.checked = r.value === state.phaseMode;
    r.addEventListener('change', function () {
      state.phaseMode = r.value;
      store.set('vt_phase', r.value);
      renderPhase();
      renderRanking(false);
      renderBottomBar();
      updateFreshness();
    });
  });

  var protoLive = $('#protoLive');
  protoLive.checked = state.live;
  protoLive.addEventListener('change', function () {
    state.live = protoLive.checked;
    store.set('vt_live', state.live);
    updateFreshness();
  });

  $('#protoReset').addEventListener('click', function () {
    if (state.myVote && byId[state.myVote]) byId[state.myVote].votes = Math.max(0, byId[state.myVote].votes - 1);
    state.myVote = null;
    state.user = null;
    store.del('vt_vote');
    store.del('vt_user');
    renderUser();
    renderRanking(false);
    renderBottomBar();
    toast('Voto e login do protótipo zerados.', 'info');
  });

  /* ─── Reveal no scroll ─────────────────────────────────── */
  var reveals = $all('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ─── Entrada do hero ──────────────────────────────────── */
  if (hasGsap && !reduceMotion) {
    gsap.from('.vt-hero-anim', { opacity: 0, y: 24, duration: 0.85, stagger: 0.12, ease: 'power3.out', delay: 0.1 });
  }

  /* ─── Inicialização ────────────────────────────────────── */
  $('#statProjects').textContent = PROJECTS.length;

  var areaParam = getParam('area');
  if (areaParam && catById[areaParam]) state.tab = areaParam;
  var qParam = getParam('q');
  if (qParam) { state.q = qParam; searchInput.value = qParam; searchClear.hidden = false; }

  renderUser();
  renderTabs();
  rankBody.setAttribute('aria-labelledby', 'tab-' + state.tab);
  renderPhase();
  renderRanking(false);
  renderBottomBar();
  updateFreshness();

  var projParam = getParam('projeto');
  if (projParam) {
    var target = PROJECTS.filter(function (p) { return p.slug === projParam; })[0];
    if (target) openDetail(target.id);
  }
})();
