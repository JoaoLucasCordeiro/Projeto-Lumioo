# UI_PATTERN.md - Guia de Design Lumioo

Este documento contém todos os padrões visuais e de estilo utilizados no frontend web do Lumioo, para servir de referência para o desenvolvimento do aplicativo mobile em React Native com Expo.

---

## 🎨 Sistema de Cores

### Cores Primárias (Vermelho/Coral)
- **Primary Red**: `#ff3131` (cor principal da marca)
- **Red-400**: `rgb(248, 113, 113)` - hover states, highlights
- **Red-500**: `rgb(239, 68, 68)` - ações principais, botões
- **Red-600**: `rgb(220, 38, 38)` - hover de botões primários
- **Red-700**: `rgb(185, 28, 28)` - estados mais escuros
- **Red-900**: `rgb(127, 29, 29)` - backgrounds de badges, overlays
- **Red-900/20**: `rgba(127, 29, 29, 0.2)` - backgrounds sutis
- **Red-900/30**: `rgba(127, 29, 29, 0.3)` - badges, avatares

### Cores de Background (Slate - Tema Escuro)
- **Background Base**: `slate-900` → `oklch(0.145 0 0)` = `rgb(15, 23, 42)`
- **Background Cards**: `slate-800/50` → `rgba(30, 41, 59, 0.5)` + backdrop blur
- **Background Input**: `slate-800` → `rgb(30, 41, 59)`
- **Background Hover**: `slate-700/50` → `rgba(51, 65, 85, 0.5)`
- **Background Secondary**: `slate-700` → `rgb(51, 65, 85)`
- **Gradient Login**: `slate-900` → `black` → `slate-900`

### Cores de Texto
- **Texto Principal**: `slate-100` → `rgb(241, 245, 249)` (quase branco)
- **Texto Secundário**: `slate-200` → `rgb(226, 232, 240)`
- **Texto Terciário**: `slate-300` → `rgb(203, 213, 225)`
- **Texto Muted**: `slate-400` → `rgb(148, 163, 184)`
- **Texto Placeholder**: `slate-500` → `rgb(100, 116, 139)`

### Cores de Borda
- **Border Base**: `slate-700` → `rgb(51, 65, 85)`
- **Border Dark**: `slate-800` → `rgb(30, 41, 59)`
- **Border Light**: `slate-600` → `rgb(71, 85, 105)`
- **Border com Opacity**: `slate-700/50`, `white/10`, `white/20`

### Cores Semânticas
- **Success/Green**: `green-600`, `green-900/30`, `green-400`
- **Info/Blue**: `blue-900/30`, `blue-400`
- **Error/Warning**: `red-400`, `red-500`, `red-600`, `red-900/20`
- **Destructive**: `oklch(0.577 0.245 27.325)` → `rgb(220, 38, 38)`

---

## 📐 Tipografia

### Fonte Base
- **Font Family**: System fonts (San Francisco, Inter, Segoe UI)

### Tamanhos de Fonte
| Classe | Tamanho | Uso |
|--------|---------|-----|
| `text-xs` | 0.75rem (12px) | Captions, badges |
| `text-sm` | 0.875rem (14px) | Labels, descrições, texto de apoio |
| `text-base` | 1rem (16px) | Texto padrão do corpo |
| `text-lg` | 1.125rem (18px) | Texto secundário de títulos |
| `text-xl` | 1.25rem (20px) | Subtítulos |
| `text-2xl` | 1.5rem (24px) | Títulos de seção, headers de cards |
| `text-3xl` | 1.875rem (30px) | Títulos principais |
| `text-4xl` | 2.25rem (36px) | Hero text |
| `text-5xl` | 3rem (48px) | Large headings |
| `text-6xl` | 3.75rem (60px) | Extra large headings |

### Font Weights
- `font-medium` - 500: Texto semibold
- `font-semibold` - 600: Títulos secundários
- `font-bold` - 700: Títulos principais, CTAs

### Line Heights
- `leading-none` - 1: Texto compacto
- `leading-tight` - 1.25: Títulos
- `leading-relaxed` - 1.625: Texto de parágrafo

---

## 📏 Espaçamento

### Escala de Espaçamento (rem/px)
| Classe | Valor | Uso |
|--------|-------|-----|
| `p-2`, `gap-2` | 0.5rem (8px) | Espaçamento pequeno |
| `p-3`, `gap-3` | 0.75rem (12px) | Espaçamento compacto |
| `p-4`, `gap-4`, `mb-4` | 1rem (16px) | Espaçamento padrão |
| `p-5` | 1.25rem (20px) | Padding de cards |
| `p-6`, `gap-6`, `mb-6` | 1.5rem (24px) | Espaçamento médio |
| `p-8`, `gap-8` | 2rem (32px) | Espaçamento grande |
| `mb-10` | 2.5rem (40px) | Margem bottom extra |
| `p-12` | 3rem (48px) | Padding extra grande |

### Espaçamentos Horizontal e Vertical
- `space-x-2` → 0.5rem entre itens horizontalmente
- `space-x-3` → 0.75rem entre itens horizontalmente
- `space-x-4` → 1rem entre itens horizontalmente
- `space-y-2` → 0.5rem entre itens verticalmente
- `space-y-4` → 1rem entre itens verticalmente
- `space-y-5` → 1.25rem entre itens verticalmente
- `space-y-6` → 1.5rem entre itens verticalmente

---

## 🔲 Border Radius

| Classe | Valor | Uso |
|--------|-------|-----|
| `rounded` | 0.25rem (4px) | Arredondamento leve |
| `rounded-md` | 0.375rem (6px) | Inputs, botões pequenos |
| `rounded-lg` | 0.5rem (8px) | Cards, botões padrão |
| `rounded-xl` | 0.75rem (12px) | Cards grandes |
| `rounded-3xl` | 1.5rem (24px) | Elementos decorativos |
| `rounded-full` | 50% | Avatares, badges redondos |

**Nota**: O projeto usa `--radius: 0.625rem` (10px) como border radius padrão.

---

## 🌑 Shadows

| Classe | Descrição |
|--------|-----------|
| `shadow-xs` | Sombra leve para cards |
| `shadow-sm` | Sombra pequena |
| `shadow-md` | Sombra média |
| `shadow-lg` | Sombra grande para modais, dialogs |
| `shadow-xl` | Sombra extra grande para cards destacados |
| `shadow-red-500/30` | Sombra colorida vermelha com 30% opacidade |
| `shadow-[#ff3131]/20` | Sombra da cor principal com 20% opacidade |
| `shadow-[#ff3131]/40` | Sombra da cor principal com 40% opacidade |

---

## 🎭 Backgrounds

### Backgrounds Sólidos
- `bg-slate-900` - Background principal da aplicação
- `bg-slate-800` - Background de cards, inputs
- `bg-slate-700` - Background de hover states
- `bg-red-500` - Background de botões primários
- `bg-red-600` - Background de hover de botões
- `bg-green-600` - Background de botões de ação (download)
- `bg-transparent` - Background transparente

### Backgrounds com Opacidade
- `bg-slate-800/50` - Cards com 50% opacidade
- `bg-slate-900/80` - Overlays escuros
- `bg-slate-900/95` - Overlays muito escuros
- `bg-slate-900/20` - Backgrounds muito sutis
- `bg-red-900/20` - Backgrounds de alerts de erro
- `bg-red-900/30` - Backgrounds de badges, avatares
- `bg-blue-900/30` - Backgrounds de badges informativos
- `bg-green-900/30` - Backgrounds de badges de sucesso

### Gradients
- `bg-gradient-to-b from-slate-900 via-black to-slate-900` - Background de login/cadastro
- `bg-gradient-to-r from-slate-800 to-slate-900` - Background de cover de perfil
- `bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800` - Background de cover padrão
- `bg-gradient-to-t from-slate-900/80 via-transparent to-transparent` - Overlay em imagens
- `bg-gradient-to-r from-red-400 to-[#ff3131]` - Texto gradient
- `bg-gradient-to-r from-[#ff3131] to-red-600` - Botões gradientes

### Backdrop Blur
- `backdrop-blur-sm` - Blur leve
- `backdrop-blur-lg` - Blur forte (cards, headers)
- `backdrop-blur-xl` - Blur extra forte (overlays)

---

## 🔘 Botões

### Variantes de Botão

#### 1. Default (Primary)
```css
bg-primary text-primary-foreground
/* No tema escuro: */
bg-slate-900 text-white
/* Versão vermelha: */
bg-red-500 text-white hover:bg-red-600
```

#### 2. Outline
```css
border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground
/* Exemplo: */
border-slate-600 text-slate-300 hover:bg-slate-700
/* Botão outline transparente: */
bg-transparent border-red-400 text-red-400 hover:bg-red-900/20
```

#### 3. Ghost
```css
hover:bg-accent hover:text-accent-foreground
/* Exemplo: */
hover:bg-slate-700/50 text-slate-300
```

#### 4. Destructive
```css
bg-destructive text-white hover:bg-destructive/90
/* Exemplo: */
bg-red-500 text-white hover:bg-red-600
```

#### 5. Link
```css
text-primary underline-offset-4 hover:underline
/* Exemplo: */
text-red-400 hover:text-red-300
```

### Tamanhos de Botão
| Size | Height | Padding | Icon Size |
|------|--------|---------|-----------|
| `sm` | h-8 (32px) | px-3 | - |
| `default` | h-9 (36px) | px-4 py-2 | size-4 |
| `lg` | h-10 (40px) | px-6 | - |
| `icon` | size-9 (36px) | - | size-4 |

### Estados de Botão
- **Disabled**: `disabled:opacity-50`
- **Hover**: `hover:scale-105` (animação de escala)
- **Focus**: `focus-visible:ring-[3px] focus-visible:ring-ring/50`

### Exemplos de Botões do Projeto

#### Botão Primário (Login/Cadastro)
```css
className="bg-gradient-to-r from-[#ff3131] to-red-600 hover:from-[#ff3131]/90 hover:to-red-600/90 text-white font-medium py-6 text-lg transition-all"
```

#### Botão Outline (Header)
```css
className="bg-transparent text-white hover:bg-red-600 hover:scale-105 hover:text-white transition-all duration-300"
```

#### Botão de Ação (Detalhes, Download)
```css
className="bg-red-600 text-white hover:bg-red-700 border-none"
/* ou */
className="bg-green-600 text-white hover:bg-green-700 border-none"
```

#### Botão de Icone (Menu, Close)
```css
className="text-slate-100 hover:bg-white/10"
```

---

## 📝 Inputs e Formulários

### Estilo Base de Input
```css
className="bg-slate-800 border-slate-700 text-slate-200 pl-10 focus:ring-red-500 focus:border-red-500"
```

### Características:
- **Height**: `h-9` (36px) - padrão
- **Border Radius**: `rounded-md` (6px)
- **Padding**: `px-3 py-1` + padding extra para ícones (`pl-10`)
- **Border**: `border-slate-700` (1px)
- **Background**: `bg-slate-800` (transparente em alguns casos)
- **Text Color**: `text-slate-200`
- **Placeholder**: `placeholder:text-muted-foreground` → `text-slate-500`
- **Focus Ring**: `focus-visible:ring-[3px] focus-visible:ring-ring/50`
- **Focus Border**: `focus:border-red-500`

### Input com Ícone
```html
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <Icon className="h-5 w-5 text-slate-500" />
  </div>
  <Input className="pl-10" />
</div>
```

### Textarea
```css
className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-red-500"
rows={3}
```

### Checkbox
```css
className="h-4 w-4 text-red-500 focus:ring-red-500 border-slate-700 rounded bg-slate-800"
```

### Select/Dropdown
```css
/* Trigger */
className="bg-slate-700 border-slate-600 text-slate-200"

/* Content */
className="bg-slate-700 border-slate-600 text-slate-200"

/* Item */
className="hover:bg-slate-700 focus:bg-slate-700"
```

### Labels
```css
className="block text-sm font-medium text-slate-300 mb-2"
```

### Datas (Calendar Picker)
```css
/* Para escurecer o picker nativo: */
[&::-webkit-calendar-picker-indicator]:invert-[0.7]
```

---

## 🃏 Cards

### Card Base
```css
className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm"
/* No tema escuro: */
className="bg-slate-800/50 backdrop-blur-sm border-slate-700 rounded-xl"
```

### Card Hover
```css
className="hover:border-red-500/30 transition-colors"
```

### Estrutura de Card
- **Padding**: `p-4` (compacto) ou `p-5` ou `p-6` (padrão)
- **Border Radius**: `rounded-xl` (12px)
- **Border**: `border-slate-700` ou `border-slate-800`
- **Shadow**: `shadow-sm`
- **Background**: `bg-slate-800/50` + `backdrop-blur-sm`

### Card Header
```css
className="px-6 grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5"
```

### Card Content
```css
className="px-6"
```

### Card Footer
```css
className="flex items-center px-6"
```

---

## 👤 Avatares

### Avatar Base
```css
className="relative flex size-8 shrink-0 overflow-hidden rounded-full"
```

### Tamanhos de Avatar
| Size | Classe | Uso |
|------|--------|-----|
| Small | `h-8 w-8` (32px) | Sidebar navigation |
| Medium | `h-10 w-10` (40px) | User mini profile |
| Large | `h-12 w-12` (48px) | Post author |
| XL | `h-24 w-24` (96px) | Profile page |
| XXL | `h-32 w-32` (128px) | Profile header |
| XXXL | `h-40 w-40` (160px) | Large profile |

### Avatar com Border
```css
className="border-2 border-red-500/30"
```

### Avatar com Borda no Profile
```css
className="border-4 border-slate-900 shadow-lg"
```

### Avatar Fallback (quando não tem imagem)
```css
className="bg-slate-700 text-red-400 font-bold"
/* ou */
className="bg-red-600 text-white text-4xl font-bold"
/* ou */
className="bg-red-900/30 text-red-400"
```

---

## 🏷️ Badges

### Badge Base
```css
className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium"
```

### Variantes de Badge

#### 1. Badge Outline (Mais Comum)
```css
className="bg-slate-900/80 backdrop-blur-sm border-slate-700 text-slate-200"
/* Badge categoria (posts): */
className="bg-red-900/20 border-red-700/50 text-red-400"
/* Badge keyword: */
className="bg-slate-700/50 border-slate-600 text-slate-300"
```

#### 2. Badge Status (Projetos)
```css
/* Concluído (Completed): */
className="bg-green-900/30 text-green-400"

/* Em andamento (In Progress): */
className="bg-blue-900/30 text-blue-400"
```

#### 3. Badge Tag/Pill
```css
className="bg-red-900/20 border-red-700/50 text-red-400 rounded-full px-4 py-2"
```

---

## 🎬 Animações

### Biblioteca: Framer Motion

### Animações de Entrada
```css
/* Fade In + Slide Up */
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

### Animações de Hover
```css
/* Scale */
whileHover={{ scale: 1.02 }}
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}

/* Slide */
whileHover={{ x: 5 }}

/* Y axis (up) */
whileHover={{ y: -5 }}
```

### Animações de Stagger
```css
/* Com delay entre itens */
transition={{ duration: 0.6, delay: index * 0.2 }}
```

### Animações de Viewport
```css
whileInView={{ opacity: 1, scale: 1 }}
viewport={{ once: true }}
```

### Transições CSS
```css
/* Geral */
transition-all duration-200
transition-colors
transition-[color,box-shadow]

/* Específicas */
transition-all duration-300
transition-opacity duration-500
transition-transform duration-300
```

### Custom Animation (Blob)
```css
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: -2s;
}
```

---

## 📐 Layout

### Breakpoints
| Breakpoint | Min Width | Devices |
|------------|-----------|---------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets landscape |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Laptops |
| `2xl` | 1536px | Desktops |

### Container
```css
className="container mx-auto px-6"
/* ou */
className="max-w-md" /* 448px */
className="max-w-lg" /* 512px */
className="max-w-xl" /* 576px */
className="max-w-2xl" /* 672px */
className="max-w-4xl" /* 896px */
```

### Flexbox
```css
/* Container */
className="flex items-center justify-between"
className="flex items-center space-x-3"
className="flex flex-col md:flex-row"

/* Item */
className="flex-1"
className="flex-shrink-0"
className="flex-grow"
```

### Grid
```css
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
className="grid grid-cols-4 items-center gap-4"
```

---

## 🎨 Componentes Específicos

### Posts/Feed Cards
```css
className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-lg mb-8 hover:border-red-500/30 transition-all"
```
- **Header**: Avatar + nome + timestamp
- **Badge**: "Novo Post" no topo (canto superior esquerdo)
- **Image**: aspect-ratio square com hover scale
- **Actions**: Heart, MessageCircle, Bookmark
- **Caption**: username + texto

### Project Cards
```css
className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer relative h-full flex flex-col"
```
- **Image Height**: `h-48` (192px)
- **Padding**: `p-5`
- **Badge Category**: Top left sobre imagem
- **Badge Status**: Bottom right

### Work Cards
```css
className="bg-slate-800/50 border-slate-700 hover:border-red-500/30 transition-colors h-full flex flex-col cursor-pointer relative overflow-hidden group"
```
- Similar ao Project Card
- Keywords com badges

### Profile Header
```css
/* Cover Photo */
className="h-48 md:h-64 w-full bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden relative"

/* Avatar sobreposto */
className="border-4 border-slate-900 shadow-lg"
className="-mt-16 mb-6" /* overlap com cover */
```

### Sidebar Navigation
```css
/* Container */
className="flex flex-col h-full p-6 w-full"

/* User Info Block */
className="flex items-center space-x-3 mb-8 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"

/* Nav Item */
className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:text-red-400 hover:bg-slate-800/50 transition-colors"
```

### Header/Landing
```css
className="fixed top-0 left-0 w-full z-50 bg-slate-900/50 backdrop-blur-lg border-b border-white/10 h-20"
```

---

## ✨ Efeitos Especiais

### Overlay em Imagens
```css
className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
```

### Glassmorphism
```css
className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10"
```

### Particles (Login/Signup)
```css
/* Partículas animadas */
className="absolute rounded-full bg-white/10"
animate={{ opacity: [0, 0.5, 0] }}
transition={{ duration: Math.random() * 10 + 5, repeat: Infinity, repeatType: "mirror", delay: Math.random() * 5 }}
```

### Background Blur Orbs
```css
className="absolute top-1/4 left-1/4 w-48 h-48 md:w-64 md:h-64 bg-red-500/10 rounded-full blur-3xl"
```

### Toast Notifications
```css
className="fixed bottom-5 right-5 flex items-center gap-4 rounded-lg px-4 py-3 text-white shadow-lg z-50"

/* Success */
bg-green-600

/* Error */
bg-red-600
```

---

## 🔔 Dialogs e Modais

### Dialog Content
```css
className="bg-slate-800 border-slate-700 text-slate-200 sm:max-w-[425px]"
```

### Dialog Overlay
```css
className="bg-black/50"
```

### Dialog Title
```css
className="text-red-400" /* ou */
className="text-slate-100"
```

### Dialog Description
```css
className="text-slate-400"
```

### Dialog Actions
```css
/* Cancel */
className="bg-slate-200 text-slate-700 hover:bg-slate-300 border-slate-200"
/* ou */
className="bg-transparent text-slate-300 border-slate-600 hover:bg-slate-700"

/* Confirm/Action */
className="bg-red-600 hover:bg-red-700"
```

---

## 🔗 Links

### Link Base (Texto)
```css
className="text-red-400 hover:text-red-300 transition-colors"
```

### Link com Underline Animation (Header)
```css
className="relative text-slate-300 font-medium transition-colors hover:text-white after:content-[''] after:block after:h-[2px] after:w-0 after:bg-red-500 after:mt-1 after:transition-all hover:after:w-full"
```

---

## ⚠️ Alertas e Mensagens de Erro

### Alert Container
```css
className="flex items-center p-3 text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg"
```

### Alert Icon
```css
<AlertCircle className="flex-shrink-0 inline w-5 h-5 mr-3" />
```

---

## 🎯 Ícones

### Biblioteca: Lucide React

### Cores de Ícones
- **Ícones Primários**: `text-red-400` ou `text-red-500`
- **Ícones Secundários**: `text-slate-300`
- **Ícones Muted**: `text-slate-400` ou `text-slate-500`

### Tamanhos de Ícone
| Size | Uso |
|------|-----|
| `h-4 w-4` (16px) | Ícones pequenos, badges |
| `h-5 w-5` (20px) | Ícones padrão, inputs |
| `h-6 w-6` (24px) | Ícones médios, botões |
| `h-8 w-8` (32px) | Ícones grandes |

---

## 🌙 Dark Mode

O projeto usa predominantemente o **tema escuro** como padrão. As variáveis CSS do dark mode são:

```css
.dark {
  --background: oklch(0.145 0 0);      /* slate-900 */
  --foreground: oklch(0.985 0 0);      /* quase branco */
  --card: oklch(0.205 0 0);            /* slate-800 */
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);         /* claro */
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);       /* slate-800 */
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0); /* slate-400 */
  --accent: oklch(0.269 0 0);
  --border: oklch(1 0 0 / 10%);        /* bordas com transparência */
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}
```

---

## 📱 Responsividade

### Mobile First
O projeto segue o princípio "mobile first", onde os estilos base são para mobile e estilos adicionais são aplicados para telas maiores:

```css
/* Base (mobile) */
className="flex flex-col"

/* Tablet e acima */
md:flex-row

/* Desktop e acima */
lg:grid-cols-3
```

### Elementos Condicionalmente Ocultos
```css
/* Ocultar em mobile, mostrar em desktop */
className="hidden md:block"

/* Mostrar em mobile, ocultar em desktop */
className="md:hidden"
```

---

## 🎨 Imagens e Gráficos

### Aspect Ratios
```css
className="aspect-square"  /* 1:1 - Posts */
className="h-48"           /* Fixed height - Cards */
```

### Object Fit
```css
className="object-cover"   /* Cover mantendo aspect ratio */
```

### Image Hover
```css
className="transition-transform duration-300 ease-in-out group-hover:scale-105"
```

---

## 📊 Resumo Rápido de Cores Principais

### Para React Native (Hex Values)
| Propósito | Web (Tailwind) | Hex/RGB |
|-----------|----------------|---------|
| Primary Red | `#ff3131` | `#FF3131` |
| Red-500 | `rgb(239, 68, 68)` | `#EF4444` |
| Red-600 | `rgb(220, 38, 38)` | `#DC2626` |
| Red-400 | `rgb(248, 113, 113)` | `#F87171` |
| Background Base | `slate-900` | `#0F172A` |
| Background Card | `slate-800` | `#1E293B` |
| Background Hover | `slate-700` | `#334155` |
| Text Primary | `slate-100` | `#F1F5F9` |
| Text Secondary | `slate-300` | `#CBD5E1` |
| Text Muted | `slate-400` | `#94A3B8` |
| Border | `slate-700` | `#334155` |
| Green Success | `green-600` | `#16A34A` |
| Blue Info | `blue-400` | `#60A5FA` |

---

## 🔧 Conversão para React Native

### Border Radius
```javascript
// Tailwind: rounded-xl
// React Native:
borderRadius: 12
```

### Padding/Margin
```javascript
// Tailwind: p-4 (1rem)
// React Native:
padding: 16

// Tailwind: mb-4
// React Native:
marginBottom: 16
```

### Opacity
```javascript
// Tailwind: bg-slate-800/50
// React Native:
backgroundColor: 'rgba(30, 41, 59, 0.5)'
```

### Shadows
```javascript
// React Native (é mais complexo):
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.25,
shadowRadius: 3.84,
elevation: 5, // para Android
```

### Backdrop Blur
```javascript
// React Native:
import { BlurView } from 'expo-blur';

<BlurView intensity={100} tint="dark" />
```

### Gradients
```javascript
// React Native:
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#0F172A', '#000000', '#0F172A']}
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }}
/>
```

---

## 📦 Recursos Adicionais

### Fontes Recomendadas para React Native
- **Inter** - Fonte mais próxima ao sistema web
- **SF Pro** (iOS) / **Roboto** (Android) - Fontes nativas

### Bibliotecas Úteis para React Native
- **expo-linear-gradient** - Para gradientes
- **expo-blur** - Para backdrop blur
- **react-native-reanimated** - Para animações (similar ao Framer Motion)
- **react-native-svg** - Para SVGs e ícones customizados
- **@gorhom/bottom-sheet** - Para bottom sheets (similar aos dialogs)
- **react-native-fast-image** - Para imagens otimizadas

---

**Documento criado em:** 19 de Fevereiro de 2026
**Versão:** 1.0
**Projeto:** Lumioo - Rede Social Acadêmica
