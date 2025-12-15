# Sorteador Amigo Categoria

Uma aplicação React completa para realizar sorteios de Amigo Secreto baseado em categorias de presente, com interface administrativa e visualização personalizada para participantes.

## 🎯 Funcionalidades

### Interface Administrativa
- **Registro de Participantes**: Adicione participantes com nome e email
- **Gerenciamento de Categorias**: Crie categorias de presente com descrição, valor mínimo e sugestões
- **Detalhes do Evento**: Configure nome, data e local do evento
- **Validação de Dados**: Sistema completo de validação antes da execução do sorteio
- **Distribuição Equilibrada**: Garante distribuição igual de categorias entre participantes

### Sistema de Sorteio
- **Algoritmo Justo**: Distribui categorias de forma aleatória e equilibrada
- **Links Únicos**: Gera links individuais e únicos para cada participante
- **Persistência Local**: Salva dados do sorteio no localStorage do navegador
- **Resultados Administrativos**: Página completa com todos os resultados e links

### Visualização do Participante
- **Interface Personalizada**: Cada participante vê apenas sua categoria sorteada
- **Informações Completas**: Exibe categoria, descrição, valor mínimo, sugestões e detalhes do evento
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Instruções Claras**: Orientações sobre como proceder com a compra do presente

## 🚀 Tecnologias Utilizadas

- **React 18**: Framework principal
- **React Router**: Navegação entre páginas
- **Vite**: Build tool e desenvolvimento
- **CSS3**: Estilização moderna e responsiva
- **UUID**: Geração de IDs únicos
- **LocalStorage**: Persistência de dados

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sorteador-amigo-categoria
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
```

4. **Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🎮 Como Usar

### 1. Configuração Inicial
1. Acesse a página principal da aplicação
2. Preencha os **Detalhes do Evento** (nome, data e local)
3. Adicione os **Participantes** com nome e email
4. Crie as **Categorias** com descrição, valor mínimo e sugestões (opcional)

### 2. Validações
O sistema verifica automaticamente:
- ✅ Todos os campos obrigatórios estão preenchidos
- ✅ Emails estão em formato válido
- ✅ Pelo menos um participante e uma categoria foram adicionados
- ✅ Valores mínimos são maiores que zero

### 3. Execução do Sorteio
1. Clique em **"Executar Sorteio"** quando todos os dados estiverem válidos
2. O sistema distribuirá as categorias automaticamente
3. Você será redirecionado para a página de resultados

### 4. Distribuição dos Links
1. Na página de resultados, você encontrará uma tabela com:
   - Nome e email de cada participante
   - Categoria sorteada para cada um
   - Link único e individual
2. Copie o link específico de cada participante
3. Envie por email, WhatsApp ou outro meio de comunicação

### 5. Visualização do Participante
- Cada participante acessa seu link único
- Vê apenas sua categoria sorteada
- Recebe todas as informações necessárias sobre o presente
- Tem acesso aos detalhes completos do evento

## 🔧 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── AdminInterface.jsx    # Interface principal administrativa
│   ├── ParticipantForm.jsx   # Formulário de participantes
│   ├── CategoryForm.jsx      # Formulário de categorias
│   ├── EventDetailsForm.jsx  # Formulário de detalhes do evento
│   ├── ParticipantView.jsx   # Visualização do participante
│   └── AdminResults.jsx      # Página de resultados administrativos
├── utils/               # Utilitários
│   ├── drawing.js            # Lógica do sorteio
│   └── storage.js            # Gerenciamento do localStorage
├── styles/              # Estilos CSS
│   ├── index.css             # Estilos base
│   └── App.css               # Estilos específicos da aplicação
├── App.jsx              # Componente principal
└── main.jsx            # Ponto de entrada da aplicação
```

## 🎨 Características do Design

### Responsivo
- Layout adaptativo para desktop, tablet e mobile
- Formulários otimizados para telas pequenas
- Tabelas com scroll horizontal quando necessário

### Interface Intuitiva
- Cores consistentes e profissionais
- Feedback visual para ações do usuário
- Estados de loading e erro bem definidos
- Mensagens de validação claras

### Experiência do Usuário
- Fluxo de trabalho linear e lógico
- Validação em tempo real
- Prevenção de erros comuns
- Instruções claras em cada etapa

## 🔒 Características de Segurança

- **Links Únicos**: Cada participante tem acesso apenas à sua informação
- **Validação de Dados**: Prevenção de dados inválidos ou malformados
- **Sem Exposição Cruzada**: Participantes não conseguem ver informações de outros
- **Armazenamento Local**: Dados ficam apenas no navegador do administrador

## 🌐 Localização

A aplicação está totalmente em **Português Brasileiro**, incluindo:
- Todas as interfaces e mensagens
- Formatos de data (DD/MM/AAAA)
- Formatação monetária (R$)
- Textos de instrução e ajuda

## 🚀 Build para Produção

```bash
npm run build
# ou
yarn build
```

Os arquivos otimizados serão gerados na pasta `dist/` e podem ser servidos por qualquer servidor web estático.

## 📝 Exemplos de Uso

### Cenário: Confraternização de Empresa
- **Participantes**: 20 funcionários
- **Categorias**: Livros, Decoração, Gourmet, Tecnologia, Bem-estar
- **Resultado**: Cada categoria será atribuída a 4 pessoas

### Cenário: Amigos da Faculdade
- **Participantes**: 8 amigos
- **Categorias**: Games, Roupas, Livros
- **Resultado**: Cada categoria será atribuída a 2-3 pessoas

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## ⚡ Comandos Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção  
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique se seguiu todos os passos de instalação
2. Consulte a documentação do React e Vite
3. Abra uma issue no repositório para reportar bugs

---

**Desenvolvido com ❤️ para facilitar seus eventos de Amigo Secreto!**