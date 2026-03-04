# Guia de Configuração e Uso do NativeWind

## O que é NativeWind?

NativeWind é uma biblioteca que permite usar classes utilitárias do Tailwind CSS diretamente em React Native, proporcionando uma experiência de desenvolvimento similar ao desenvolvimento web com Tailwind, mas compilando para estilos nativos de iOS e Android.

## Arquitetura de Duas Camadas de Estilização

O projeto Atlas usa uma abordagem híbrida para estilização:

1. **NativeWind (Tailwind CSS)**: Para estilos estáticos de layout
2. **ThemeContext**: Para cores dinâmicas que mudam em tempo de execução

---

## Configuração do NativeWind

### 1. Dependências Instaladas

No `package.json`:

```json
{
  "dependencies": {
    "nativewind": "^4.2.1",
    "tailwindcss": "^3.4.18"
  }
}
```

### 2. Configuração do Babel (`babel.config.js`)

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

**Propósito**: O Babel transpila as classes do NativeWind para estilos React Native nativos durante o build.

- `jsxImportSource: "nativewind"`: Informa ao Babel para usar o NativeWind como fonte de JSX
- `nativewind/babel`: Preset do NativeWind que processa as classes utilitárias

### 3. Configuração do Tailwind (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'neon-lime': '#e4fe45',
        'electric-purple': '#b77eff',
        'deep-navy': '#3f4059',
        'glass-light': '#ffffff',
        'glass-medium': '#ffffff',
        'text-secondary': '#a0a0b8',
        'text-muted': '#6b6b8a',
        'map-dark': '#2B2D42',
      },
    },
  },
  plugins: [],
}
```

**Explicação das propriedades**:

- **`content`**: Define quais arquivos o Tailwind deve escanear para encontrar classes
  - Escaneia `app/` (telas) e `components/` (componentes reutilizáveis)
  - Apenas arquivos `.js`, `.jsx`, `.ts`, `.tsx`

- **`presets`**: Usa o preset nativewind que fornece as classes compatíveis com React Native

- **`theme.extend`**: Cores customizadas que podem ser usadas como classes Tailwind
  - Exemplo: `className="bg-neon-lime text-deep-navy"`

### 4. Arquivo Global CSS (`global.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Propósito**: Injeta as diretivas do Tailwind que são processadas pelo Metro bundler.

### 5. Importação no Layout Root (`app/_layout.tsx`)

```typescript
import '../global.css';

export default function RootLayout() {
  return (
    <ThemeProvider>
      {/* ... */}
    </ThemeProvider>
  );
}
```

**Importante**: O `global.css` deve ser importado no arquivo de layout root para que o Tailwind/NativeWind funcione em toda a aplicação.

### 6. Definição de Tipos TypeScript (`nativewind-env.d.ts`)

```typescript
/// <reference types="nativewind/types" />
```

**Propósito**: Fornece autocompletar e verificação de tipos para as classes do NativeWind no TypeScript.

---

## Uso do NativeWind

### Sintaxe Básica

```tsx
import { View, Text } from 'react-native';

function MyComponent() {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-xl font-bold text-white">Olá, NativeWind!</Text>
    </View>
  );
}
```

### Classes Mais Comuns

**Layout**:
- `flex-1`: Ocupa todo o espaço disponível (flex: 1)
- `flex-row`: Layout em linha (flexDirection: 'row')
- `items-center`: Alinha itens no centro verticalmente
- `justify-center`: Alinha conteúdo no centro horizontalmente
- `justify-between`: Espaça itens com espaço entre eles

**Espaçamento**:
- `p-4`: Padding de 16px (1 unidade = 4px)
- `px-4`: Padding horizontal de 16px
- `py-2`: Padding vertical de 8px
- `m-2`: Margin de 8px
- `mt-4`: Margin top de 16px
- `mb-2`: Margin bottom de 8px

**Tamanho**:
- `w-full`: Largura 100%
- `h-full`: Altura 100%
- `w-1/2`: Largura 50%
- `h-32`: Altura fixa de 128px

**Texto**:
- `text-sm`: Font size 14px
- `text-base`: Font size 16px
- `text-lg`: Font size 18px
- `text-xl`: Font size 20px
- `text-2xl`: Font size 24px
- `font-bold`: Font weight 700
- `font-medium`: Font weight 500
- `text-center`: Alinhamento central

**Cores**:
- `bg-white`: Background color branco
- `bg-black`: Background color preto
- `text-blue-500`: Cor do texto azul
- `border-gray-200`: Cor da borda

**Outros**:
- `rounded-lg`: Border radius large
- `rounded-full`: Borda completamente redonda
- `shadow-md`: Sombra média
- `opacity-50`: Opacidade 50%

---

## Integração com ThemeContext

### Cores Dinâmicas vs Estáticas

O projeto usa um sistema híbrido:

1. **Cores Estáticas (Tailwind/NativeWind)**: Cores que não mudam
   - Cores customizadas do `tailwind.config.js`
   - Cores padrão do Tailwind

2. **Cores Dinâmicas (ThemeContext)**: Cores que mudam com o tema
   - `colors.background`, `colors.accent`, `colors.textPrimary`, etc.

### Exemplo Prático

```tsx
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center p-4"
      style={{ backgroundColor: colors.background }}  // Cor dinâmica
    >
      <Text className="text-xl font-bold mb-4">Título</Text>

      <Pressable
        className="px-6 py-3 rounded-lg"
        style={{ backgroundColor: colors.accent }}  // Cor dinâmica
      >
        <Text className="text-white font-semibold">Botão</Text>
      </Pressable>
    </View>
  );
}
```

### Quando Usar Cada Abordagem

**Use NativeWind (`className`)** para:
- Layout (flex, grid, positioning)
- Espaçamento (padding, margin)
- Tamanhos fixos
- Bordas, bordas arredondadas
- Sombras
- Cores estáticas que não mudam com o tema

**Use Inline Styles com `colors`** para:
- Background colors que mudam com o tema
- Text colors que mudam com o tema
- Border colors dinâmicas
- Qualquer propriedade que dependa do tema selecionado

---

## Combinando NativeWind com Reanimated

O NativeWind funciona perfeitamente com React Native Reanimated:

```tsx
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { Pressable } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MyButton() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      className="bg-blue-500 p-4 rounded-lg"
      style={animatedStyle}
    >
      <Text className="text-white font-bold">Press me</Text>
    </AnimatedPressable>
  );
}
```

---

## Boas Práticas

### 1. Priorize `className` para Estilos Estáticos

```tsx
// ✅ Bom
<View className="flex-1 p-4 rounded-lg">

// ❌ Evite
<View style={{ flex: 1, padding: 16, borderRadius: 8 }}>
```

### 2. Use Inline Styles Apenas para Cores Dinâmicas

```tsx
// ✅ Bom - mistura de className e style para cores dinâmicas
<View
  className="flex-1 p-4 rounded-lg"
  style={{ backgroundColor: colors.background }}
>

// ❌ Evite - tudo em style quando poderia usar className
<View style={{
  flex: 1,
  padding: 16,
  borderRadius: 8,
  backgroundColor: colors.background
}}>
```

### 3. Use Classes Tailwind Customizadas

```tsx
// ✅ Usa cor customizada do tailwind.config.js
<Text className="text-neon-lime">Destaque</Text>

// Em vez de
<Text style={{ color: '#e4fe45' }}>Destaque</Text>
```

### 4. Mantenha Consistência nos Arquivos

Configure o ESLint e Prettier para classificar classes do Tailwind:

```json
// .prettierrc
{
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Isso organiza automaticamente as classes em uma ordem consistente.

---

## Exemplos de Componentes do Projeto

### Botão com Animação

```tsx
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  onPress: () => void;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  variant = 'primary',
  onPress,
  children,
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.accent };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.accent
        };
      default:
        return { backgroundColor: colors.accent };
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
          ...getVariantStyles(),
        }
      ]}
      className={className}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text className="text-lg font-bold text-white">
          {children}
        </Text>
      )}
    </AnimatedPressable>
  );
}
```

### Card com Tema Dinâmico

```tsx
import { useTheme } from '@/contexts/ThemeContext';
import { View, Text, Pressable } from 'react-native';

interface CardProps {
  title: string;
  description: string;
  onPress: () => void;
}

export default function Card({ title, description, onPress }: CardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="w-full p-4 mb-4 rounded-xl shadow-md"
      style={{
        backgroundColor: colors.container,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      <Text className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>
        {title}
      </Text>
      <Text className="text-base" style={{ color: colors.textSecondary }}>
        {description}
      </Text>
    </Pressable>
  );
}
```

---

## Referências Úteis

- [Documentação Oficial do NativeWind v4](https://www.nativewind.dev/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Lista Completa de Classes do Tailwind](https://tailwindcomponents.com/cheatsheet/)

## Notas Específicas do Projeto Atlas

- **Versão do NativeWind**: 4.2.1 (última versão estável)
- **Compatibilidade**: Expo SDK ~54, React Native 0.81.5
- **Suporte a Web**: NativeWind v4 suporta plenamente React Native Web
- **Performance**: Classes são compiladas para estilos nativos durante o build, sem overhead em runtime
