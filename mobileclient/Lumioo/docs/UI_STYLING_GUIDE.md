# Guia de Estilização do Atlas - React Native + NativeWind

> Um guia completo para entender e replicar o sistema de estilização do Atlas Unite

## Índice

1. [Visão Geral](#visão-geral)
2. [Stack de Tecnologias](#stack-de-tecnologias)
3. [Configuração do NativeWind](#configuração-do-nativewind)
4. [Sistema de Temas](#sistema-de-temas)
5. [Padrões de Estilização](#padrões-de-estilização)
6. [Como Replicar em um Novo Projeto](#como-replicar-em-um-novo-projeto)
7. [Boas Práticas](#boas-práticas)
8. [Exemplos Práticos](#exemplos-práticos)

---

## Visão Geral

O Atlas Unite utiliza um **sistema híbrido de estilização** que combina:

- **NativeWind 4.x** para estilos utilitários (Tailwind CSS no React Native)
- **React Context** para temas dinâmicos (atlas/dark/light)
- **Estilos inline** para cores dinâmicas do tema
- **StyleSheet** para estilos estáticos complexos

Essa abordagem oferece:
- Rapidez no desenvolvimento com classes utilitárias
- Temas dinâmicos que persistem entre sessões
- Type safety com TypeScript
- Performance otimizada

---

## Stack de Tecnologias

### Dependências Principais

```json
{
  "nativewind": "^4.2.1",
  "tailwindcss": "^3.4.18",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo": "~54.0.19"
}
```

### Dependências Complementares

- `@react-native-async-storage/async-storage` - Persistência do tema
- `react-native-reanimated` - Animações
- `expo-haptics` - Feedback háptico
- `@expo/vector-icons` - Ícones

---

## Configuração do NativeWind

### Passo 1: Instalação das Dependências

```bash
npm install nativewind tailwindcss
npm install -D prettier-plugin-tailwindcss
```

### Passo 2: Configurar o Babel (`babel.config.js`)

O NativeWind precisa ser configurado no Babel para processar as classes:

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

**Explicação:**
- `jsxImportSource: "nativewind"` - Diz ao Babel para usar o NativeWind como fonte de JSX
- `nativewind/babel` - Preset do NativeWind que transforma classes em estilos React Native

### Passo 3: Configurar o Tailwind (`tailwind.config.js`)

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
        // Cores personalizadas do app
        'neon-lime': '#e4fe45',
        'electric-purple': '#b77eff',
        'deep-navy': '#3f4059',
        'glass-light': '#ffffff',
        'text-secondary': '#a0a0b8',
        'text-muted': '#6b6b8a',
        'map-dark': '#2B2D42',
      },
    },
  },
  plugins: [],
}
```

**Explicação:**
- `content` - Define quais arquivos serão escaneados para classes Tailwind
- `presets: [require("nativewind/preset")]` - **CRUCIAL**: Carrega o preset do NativeWind
- `theme.extend.colors` - Define cores customizadas que podem ser usadas como `text-neon-lime`, `bg-electric-purple`

### Passo 4: Importar o Global CSS (`global.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Este arquivo é importado no `_layout.tsx`:

```tsx
import '../global.css';

export default function RootLayout() {
  return (
    <ThemeProvider>
      {/* ... */}
    </ThemeProvider>
  );
}
```

**Importante:** O NativeWind 4.x requer esse arquivo para carregar as definições do Tailwind.

### Passo 5: Configurar o TypeScript

Adicione ao `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["nativewind/types"]
  }
}
```

Isso provide autocompletion para classes Tailwind.

---

## Sistema de Temas

### Estrutura do Contexto de Tema

O ThemeContext gerencia **três temas**:

```typescript
type ThemeType = 'atlas' | 'dark' | 'light';
```

### Definição das Cores

```typescript
interface ThemeColors {
  background: string;
  accent: string;
  container: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
}

const themes: Record<ThemeType, ThemeColors> = {
  atlas: {
    background: '#6000e5',      // Roxo vibrante
    accent: '#f75e36',           // Laranja
    container: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.6)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  dark: {
    background: '#000000',       // Preto profundo
    accent: '#f75e36',           // Laranja (mesmo accent)
    container: '#1a1a1a',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.6)',
    border: '#262626',
  },
  light: {
    background: '#f5f5f5',       // Branco suave
    accent: '#f75e36',           // Laranja (mesmo accent)
    container: '#ffffff',
    textPrimary: '#1a1a1a',
    textSecondary: 'rgba(26, 26, 26, 0.7)',
    textTertiary: 'rgba(26, 26, 26, 0.5)',
    border: '#e0e0e0',
  },
};
```

**Padrão de Cores:**
- `background` - Cor de fundo principal
- `accent` - Cor de destaque (CTAs, elementos ativos)
- `container` - Fundo de cartões e containers
- `textPrimary` - Texto principal
- `textSecondary` - Texto secundário
- `textTertiary` - Texto terciário/placeholders
- `border` - Bordas e divisores

### Implementação do Contexto

```tsx
// contexts/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('atlas');

  // Carregar tema salvo
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme === 'atlas' || savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('app_theme', newTheme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const toggleTheme = () => {
    const themeOrder: ThemeType[] = ['atlas', 'dark', 'light'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const newTheme = themeOrder[nextIndex];
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: themes[theme], toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};
```

### Uso do Hook `useTheme`

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { colors, theme, setTheme } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Texto principal</Text>
      <Text style={{ color: colors.textSecondary }}>Texto secundário</Text>
    </View>
  );
}
```

---

## Padrões de Estilização

### Padrão 1: Híbrido NativeWind + Inline Styles

**Regra:** Use NativeWind para **layout, espaçamento, e propriedades estáticas**. Use **inline styles** para cores dinâmicas do tema.

```tsx
// ✅ CORRETO
<View
  className="flex-1 items-center justify-center p-4 rounded-2xl"
  style={{
    backgroundColor: colors.container,  // Dinâmico
    borderWidth: 1,
    borderColor: colors.border,         // Dinâmico
  }}
>
  <Text
    className="text-lg font-bold"
    style={{ color: colors.textPrimary }}  // Dinâmico
  >
    Título
  </Text>
</View>

// ❌ EVITAR
<View
  style={{
    flex: 1,
    alignItems: 'center',     // Deveria ser classe
    justifyContent: 'center', // Deveria ser classe
    padding: 16,              // Deveria ser classe
    backgroundColor: colors.container,
  }}
>
```

### Padrão 2: Componentes Reutilizáveis

Crie componentes que aceitam `className` e `style`:

```tsx
// components/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export default function Button({
  variant = 'primary',
  onPress,
  children,
  className = '',
  style = {}
}: ButtonProps) {
  const { colors } = useTheme();

  const getVariantStyles = (): ViewStyle => {
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
    <Pressable
      onPress={onPress}
      style={[
        {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          ...getVariantStyles(),
          ...style  // Permite sobrescrita
        }
      ]}
      className={className}  // Classes adicionais
    >
      <Text style={{ color: '#ffffff' }}>
        {children}
      </Text>
    </Pressable>
  );
}
```

**Uso:**

```tsx
<Button
  variant="primary"
  onPress={handleSubmit}
  className="mt-4 active:scale-95"
  style={{ opacity: disabled ? 0.5 : 1 }}
>
  Salvar
</Button>
```

### Padrão 3: Animações com Reanimated

Use `react-native-reanimated` para animações suaves:

```tsx
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MyButton() {
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

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="active:scale-95"
    >
      <Text>Press me</Text>
    </AnimatedPressable>
  );
}
```

### Padrão 4: Feedback Háptico

Sempre adicione feedback háptico em interações:

```tsx
import * as Haptics from 'expo-haptics';

const handlePress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // ... sua lógica
};

const handleDelete = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  // ... deletar
};
```

**Estilos de feedback:**
- `Light` - Toques leves
- `Medium` - Ações moderadas
- `Heavy` - Ações destrutivas ou importantes

### Padrão 5: Modais e Overlays

Use `Modal` com backdrop escuro:

```tsx
<Modal
  visible={showModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowModal(false)}
>
  <Pressable
    onPress={() => setShowModal(false)}
    style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
  >
    <Pressable className="flex-1 justify-center p-6">
      <View
        className="rounded-3xl p-6"
        style={{
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Conteúdo do modal */}
      </View>
    </Pressable>
  </Pressable>
</Modal>
```

---

## Como Replicar em um Novo Projeto

### Checklist Completo de Configuração

#### 1. Criar projeto Expo

```bash
npx create-expo-app@latest meu-app --template blank-typescript
cd meu-app
```

#### 2. Instalar dependências

```bash
npm install nativewind tailwindcss
npm install @react-native-async-storage/async-storage
npm install react-native-reanimated
npm install expo-haptics
npm install @expo/vector-icons

npm install -D prettier-plugin-tailwindcss
```

#### 3. Configurar arquivos

**`babel.config.js`:**

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

**`tailwind.config.js`:**

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
        // Suas cores customizadas
      },
    },
  },
  plugins: [],
}
```

**`global.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 4. Criar o ThemeContext

**`contexts/ThemeContext.tsx`:**

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'dark' | 'light';

interface ThemeColors {
  background: string;
  text: string;
  // ... outras cores
}

const themes: Record<ThemeType, ThemeColors> = {
  dark: {
    background: '#000000',
    text: '#ffffff',
  },
  light: {
    background: '#ffffff',
    text: '#000000',
  },
};

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('app_theme', newTheme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: themes[theme], toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};
```

#### 5. Configurar o Layout Root

**`app/_layout.tsx`:**

```tsx
import { ThemeProvider } from '@/contexts/ThemeContext';
import '../global.css';

export default function RootLayout() {
  return (
    <ThemeProvider>
      {/* ... resto do layout */}
    </ThemeProvider>
  );
}
```

#### 6. Criar componentes base

**`components/Button.tsx`:** (veja exemplo acima)
**`components/Input.tsx`:** (veja exemplo acima)

#### 7. Começar a desenvolver

```tsx
// app/index.tsx
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/Button';

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center p-6"
      style={{ backgroundColor: colors.background }}
    >
      <Text
        className="text-2xl font-bold mb-4"
        style={{ color: colors.text }}
      >
        Bem-vindo!
      </Text>
      <Button onPress={() => {}}>
        Começar
      </Button>
    </View>
  );
}
```

---

## Boas Práticas

### 1. Separação de Responsabilidades

- **Layout/Espaçamento** → NativeWind classes
- **Cores dinâmicas** → Inline styles via `useTheme()`
- **Animações** → Reanimated
- **Estilos complexos** → StyleSheet.create()

### 2. Nomenclatura de Cores

Use nomes semânticos, não nomes de cores:

```tsx
// ✅ BOM
colors.textPrimary
colors.background
colors.accent

// ❏ RUIM
colors.white
colors.purple600
colors.black
```

### 3. Consistência em Componentes

Mantenha a mesma API em todos os componentes:

```tsx
interface ComponentProps {
  // Propriedades de estilo sempre por último
  className?: string;
  style?: ViewStyle;
}
```

### 4. Evite Aninhamento Profundo

NativeWind é poderoso, mas evite:

```tsx
// ❌ EVITAR
<View className="flex flex-row items-center justify-center">
  <View className="flex flex-col items-center justify-center">
    <View className="flex flex-row items-center justify-center">
      {/* ... */}
    </View>
  </View>
</View>

// ✅ USE UM StyleSheet
<View style={styles.container}>
  {/* ... */}
</View>

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### 5. Performance

- Use `React.memo` em componentes que renderizam frequentemente
- Evite criar funções/objetos durante renderização
- Use `useCallback` para handlers passados como props

---

## Exemplos Práticos

### Exemplo 1: Card com Tema

```tsx
function UserCard({ name, avatar, onPress }: UserCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-4 rounded-2xl active:scale-98"
      style={{
        backgroundColor: colors.container,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Image
        source={{ uri: avatar }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <Text
        className="text-lg font-semibold"
        style={{ color: colors.textPrimary }}
      >
        {name}
      </Text>
    </Pressable>
  );
}
```

### Exemplo 2: Input com Erro

```tsx
function Input({ label, error, value, onChangeText }: InputProps) {
  const { colors } = useTheme();

  return (
    <View className="mb-4">
      {label && (
        <Text
          className="font-semibold mb-2 ml-1 text-sm"
          style={{ color: colors.textPrimary }}
        >
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="rounded-xl px-4 py-3.5 text-base"
        style={{
          backgroundColor: colors.container,
          color: colors.textPrimary,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : 'transparent',
        }}
        placeholderTextColor={colors.textTertiary}
      />
      {error && (
        <Text className="text-red-400 text-sm mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
```

### Exemplo 3: Lista de Itens

```tsx
function SettingsList({ items }: SettingsListProps) {
  const { colors } = useTheme();

  return (
    <View
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: colors.container }}
    >
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={item.onPress}
          className="flex-row items-center p-4 active:scale-98"
          style={{
            borderBottomWidth: index === items.length - 1 ? 0 : 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-4"
            style={{ backgroundColor: `${colors.accent}20` }}
          >
            <Ionicons name={item.icon} size={20} color={colors.accent} />
          </View>
          <Text
            className="flex-1 font-semibold"
            style={{ color: colors.textPrimary }}
          >
            {item.title}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
          />
        </Pressable>
      ))}
    </View>
  );
}
```

### Exemplo 4: Floating Action Button

```tsx
function FAB({ icon, onPress }: FABProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        animatedStyle,
        {
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }
      ]}
    >
      <Ionicons name={icon} size={24} color="#ffffff" />
    </AnimatedPressable>
  );
}
```

---

## Resumo

### Padrão Final de Estilização

```tsx
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { View, Text, Pressable } from 'react-native';

function MyComponent() {
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // ... lógica
  };

  return (
    <View
      className="flex-1 items-center justify-center p-6"
      style={{ backgroundColor: colors.background }}
    >
      {/* Container com fundo dinâmico */}
      <View
        className="rounded-2xl p-6 w-full"
        style={{
          backgroundColor: colors.container,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Ícone com background */}
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mb-4"
          style={{ backgroundColor: `${colors.accent}20` }}
        >
          <Ionicons name="checkmark" size={24} color={colors.accent} />
        </View>

        {/* Texto com cor dinâmica */}
        <Text
          className="text-xl font-bold mb-2"
          style={{ color: colors.textPrimary }}
        >
          Título
        </Text>

        <Text
          className="text-base"
          style={{ color: colors.textSecondary }}
        >
          Descrição
        </Text>

        {/* Botão */}
        <Pressable
          onPress={handlePress}
          className="mt-4 rounded-xl p-4 items-center active:scale-95"
          style={{ backgroundColor: colors.accent }}
        >
          <Text className="text-white font-semibold">
            Ação
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

---

## Conclusão

O sistema de estilização do Atlas combina o melhor de dois mundos:

1. **Velocidade** do Tailwind CSS via NativeWind
2. **Flexibilidade** de temas dinâmicos via React Context

Para replicar:
1. Configure NativeWind corretamente (Babel + Tailwind)
2. Crie um ThemeContext com AsyncStorage
3. Siga o padrão híbrido (classes + inline styles)
4. Use componentes reutilizáveis
5. Adicione feedback háptico e animações

Este padrão escala bem para projetos de qualquer tamanho e mantém o código limpo e manutenível.
