# 💡 Ideias de Animação para o Mascote Lampejo (Seção Áreas do Conhecimento)

Documento de referência contendo 5 propostas de animação e posicionamento para o mascote **Lampejo** na seção *Áreas do Conhecimento* sem sobrepor os textos dos cards do Bento Grid.

---

### 1. **O "Efeito Espreitar" (Pop-up Peek-a-Boo ao Hover / Scroll)**
- **Conceito**: O Lampejo fica recolhido e escondido atrás da borda inferior direita da página ou do container, mostrando apenas o topo de sua cabeça/óculos quando estático.
- **Animação**:
  - Quando a seção entra na tela (ou quando o usuário passa o mouse sobre o card *Inovação Estudantil*), ele realiza um movimento rápido de subir (`translateY(0)`), espia alegremente a tela, acende a lâmpada da cabeça com um brilho suave e aponta o dedo para cima.
  - Ao retirar o mouse, ele se recolhe suavemente para baixo (`translateY(70%)`).
- **Vantagem**: Deixa a leitura dos cards 100% livre no estado padrão e cria um momento de surpresa e encantamento (*micro-interação*).

---

### 2. **O "Mascote Flutuante na Margem Externa" (Side Sentinel)**
- **Conceito**: Posicionar o Lampejo fora do grid dos cards, aproveitando a margem externa direita da tela (ou no topo, ao lado do cabeçalho da seção).
- **Animação**:
  - Uma animação contínua e suave de flutuação tipo *bobbing/gravidade zero* (subindo e descendo cerca de `8px` em *loop* suave de 3 segundos).
  - A lâmpada pisca suavemente. Quando o usuário passa o mouse sobre qualquer um dos cards do Bento Grid, o Lampejo gira a cabeça ou olha na direção daquele card específico.
- **Vantagem**: Não ocupa nenhum pixel útil do grid e cria a sensação de um "assistente interativo" orientando a leitura.

---

### 3. **Recorte PNG Transparente + Revelação Tátil no Hover**
- **Conceito**: Remover a caixa branca quadrada do fundo do mascote (deixando apenas o contorno PNG transparente com *drop-shadow* de luz amarela/verde).
- **Animação**:
  - No estado normal, ele fica miniaturizado no cantinho com opacidade reduzida (`opacity: 0.35`) ou em modo marca d'água neon.
  - Quando o usuário dá hover no card, o card expande levemente seu padding e o Lampejo dá um pequeno pulo para fora do card (`scale: 1.15` com `ease: back.out`), acendendo a luz com intensidade 100%.
- **Vantagem**: Elimina a impressão de "imagem colada por cima" e transforma o mascote em um elemento 3D fluido que reage ao cursor.

---

### 4. **Animação de Escalada/Apoio na Borda Superior (Top-Card Anchor)**
- **Conceito**: Em vez do canto inferior direito, coloque o Lampejo "apoiado" na borda superior do primeiro card grande azul (*Ciências Agrárias & Ambientais*) ou sentado sobre a linha de divisão do cabeçalho.
- **Animação**:
  - Ele fica sentado balançando as perninhas para fora do card e segurando um caderninho ou lâmpada.
  - Ao rolar a página, solta pequenas faíscas SVG brilhantes que caem suavemente e somem antes de tocar nos textos.
- **Vantagem**: Coloca o Lampejo no topo visual da seção (posição de honra) sem atrapalhar a matriz de cards abaixo.

---

### 5. **O "8º Card Exclusivo" no Bento Grid (Card do Mascote)**
- **Conceito**: Em vez de posicionar o Lampejo de forma absoluta sobre os cards existentes, reserve um espaço dedicado no próprio Bento Grid (transformando o layout em 3x3 ou estendendo a última linha).
- **Animação**:
  - O Lampejo vive dentro de seu próprio card estilizado com fundo escuro e padrão geométrico de fundo.
  - Dentro do card, ele realiza animações completas: acende a ideia, limpa os óculos, interage com engrenagens de robótica ou segura um tubo de ensaio.
- **Vantagem**: Acomodação arquitetônica perfeita, alinhada ao Design System sem risco de conflito de texto em nenhuma resolução de tela.
