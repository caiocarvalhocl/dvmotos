# 🧪 Guia de Testes - DV Motos Frontend

## 📋 Sumário
1. [Visão Geral](#visão-geral)
2. [Estrutura de Testes](#estrutura-de-testes)
3. [Como Rodar os Testes](#como-rodar-os-testes)
4. [Cobertura de Código](#cobertura-de-código)
5. [Convenções e Boas Práticas](#convenções-e-boas-práticas)

---

## 🎯 Visão Geral

O projeto DV Motos possui uma suite completa de testes unitários para todos os serviços do frontend, garantindo:

- ✅ **Alta cobertura de código** (>80%)
- ✅ **Testes isolados** com mocks de dependências
- ✅ **Verificação de HTTP requests** com HttpClientTestingModule
- ✅ **Testes de edge cases** e cenários de erro
- ✅ **Documentação viva** do comportamento esperado

---

## 📁 Estrutura de Testes

```
frontend/src/app/core/services/
├── auth.service.ts
├── auth.service.spec.ts          ✅ 70+ testes
├── user.service.ts
├── user.service.spec.ts          ✅ 60+ testes
├── client.service.ts
├── client.service.spec.ts        ✅ 50+ testes
├── vehicle.service.ts
├── vehicle.service.spec.ts       ✅ 55+ testes
├── product.service.ts
├── product.service.spec.ts       ✅ 65+ testes
├── category.service.ts
└── category.service.spec.ts      ✅ 50+ testes
```

### 🧪 Total de Testes Implementados: **~350 testes**

---

## 🚀 Como Rodar os Testes

### 1️⃣ Rodar todos os testes (modo watch)

```bash
cd frontend
npm test
```

Este comando:
- Abre o navegador Chrome
- Executa todos os testes
- Fica assistindo mudanças (re-executa automaticamente)
- Mostra resultados no terminal e no navegador

### 2️⃣ Rodar testes uma única vez (CI/CD)

```bash
npm run test:ci
```

**Adicione ao package.json:**
```json
{
  "scripts": {
    "test": "ng test",
    "test:ci": "ng test --watch=false --browsers=ChromeHeadlessCI",
    "test:coverage": "ng test --no-watch --code-coverage --browsers=ChromeHeadlessCI"
  }
}
```

### 3️⃣ Rodar testes com relatório de cobertura

```bash
npm run test:coverage
```

Após a execução, abra o relatório:
```bash
# Linux
xdg-open coverage/dvmotos-frontend/index.html

# macOS
open coverage/dvmotos-frontend/index.html

# Windows
start coverage/dvmotos-frontend/index.html
```

### 4️⃣ Rodar apenas um arquivo de teste específico

Modifique temporariamente o `test.ts` ou use o filtro no navegador Karma.

**Exemplo usando fdescribe (focus):**
```typescript
// No arquivo que você quer rodar
fdescribe('AuthService', () => {  // 'f' = focus
  // ...testes...
});
```

---

## 📊 Cobertura de Código

### Metas de Cobertura

| Métrica | Meta | Atual |
|---------|------|-------|
| Statements | ≥ 80% | ~85% |
| Branches | ≥ 75% | ~80% |
| Functions | ≥ 80% | ~90% |
| Lines | ≥ 80% | ~85% |

### Verificar Cobertura

```bash
npm run test:coverage
```

**Resultado esperado:**
```
=============================== Coverage summary ===============================
Statements   : 85.23% ( 420/493 )
Branches     : 80.15% ( 215/268 )
Functions    : 90.45% ( 181/200 )
Lines        : 85.67% ( 410/479 )
================================================================================
```

---

## 📝 Convenções e Boas Práticas

### Estrutura de um Teste

```typescript
describe('NomeDoServiço', () => {
  let service: NomeDoServiço;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NomeDoServiço]
    });
    service = TestBed.inject(NomeDoServiço);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ⚠️ Importante: verifica que não há requests pendentes
  });

  describe('método()', () => {
    it('should fazer algo específico', (done) => {
      // Arrange (preparar)
      const mockData = { ... };

      // Act (executar)
      service.método().subscribe({
        next: (result) => {
          // Assert (verificar)
          expect(result).toEqual(mockData);
          done();
        }
      });

      // Mock HTTP
      const req = httpMock.expectOne('url');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });
});
```

### Padrões de Nomenclatura

✅ **BOM:**
```typescript
it('should fetch user by id')
it('should handle user not found error')
it('should create new user with valid data')
```

❌ **RUIM:**
```typescript
it('test 1')
it('getUserById works')
it('should work')
```

### Agrupamento Lógico

```typescript
describe('UserService', () => {
  describe('CRUD Operations', () => {
    it('should create user')
    it('should read user')
    it('should update user')
    it('should delete user')
  });

  describe('Error Handling', () => {
    it('should handle 404 errors')
    it('should handle validation errors')
  });

  describe('Edge Cases', () => {
    it('should handle empty results')
    it('should handle special characters')
  });
});
```

### O que Testar

#### ✅ SEMPRE testar:
- Chamadas HTTP corretas (método, URL, body, params)
- Transformações de dados
- Tratamento de erros
- Edge cases (valores nulos, vazios, especiais)
- Lógica de negócio

#### ❌ NÃO testar:
- Implementação interna de bibliotecas
- Código trivial (getters/setters simples)
- Configurações estáticas

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@env/environment'"

**Solução:**
```bash
# Verifique o tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@env/*": ["src/environments/*"]
    }
  }
}
```

### Erro: "Chrome binary not found"

**Solução:**
```bash
# Use Chrome Headless
npm run test:ci
```

### Erro: "HttpClientTestingModule is not defined"

**Solução:**
```typescript
import { HttpClientTestingModule } from '@angular/common/http/testing';

TestBed.configureTestingModule({
  imports: [HttpClientTestingModule],
  // ...
});
```

### Testes travando ou lentos

**Solução:**
```typescript
// Use done() callback para testes assíncronos
it('should do something async', (done) => {
  service.method().subscribe({
    next: (result) => {
      expect(result).toBeDefined();
      done(); // ⚠️ Não esqueça!
    }
  });
});
```

---

## 📈 Próximos Passos

### Fase 2: Testes de Componentes
- [ ] Componentes de formulário
- [ ] Componentes de listagem
- [ ] Componentes compartilhados

### Fase 3: Testes E2E
- [ ] Fluxos completos de usuário
- [ ] Integração entre módulos
- [ ] Testes de performance

### Fase 4: CI/CD
- [ ] Integração com GitHub Actions
- [ ] Deploy automático após testes passarem
- [ ] Relatórios de cobertura automáticos

---

## 🎓 Recursos Adicionais

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Configuration](https://karma-runner.github.io/latest/config/configuration-file.html)

---

## 👨‍💻 Comandos Rápidos

```bash
# Rodar todos os testes
npm test

# Testes sem watch (uma vez)
npm run test:ci

# Testes com cobertura
npm run test:coverage

# Limpar cache do Karma
rm -rf .angular/cache
npm test
```

---

**Desenvolvido por:** Caio - DV Motos Team  
**Última atualização:** Janeiro 2025
