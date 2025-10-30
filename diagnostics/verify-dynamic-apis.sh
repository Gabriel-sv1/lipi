#!/bin/bash

echo "================================================"
echo "  Verificação de APIs Dinâmicas - Next.js 15"
echo "================================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de problemas
ISSUES=0

echo "1️⃣  Verificando versões..."
echo "   Node.js: $(node -v)"
echo "   Next.js: $(npx next -v)"
echo "   npm: $(npm -v)"
echo ""

echo "2️⃣  Verificando dev script..."
DEV_SCRIPT=$(grep '"dev"' package.json)
if [[ $DEV_SCRIPT == *"--turbo"* ]] || [[ $DEV_SCRIPT == *"--turbopack"* ]]; then
  echo -e "   ${GREEN}✓${NC} Turbopack ativado"
else
  echo -e "   ${RED}✗${NC} Turbopack NÃO ativado (recomendado para WebContainers)"
  ISSUES=$((ISSUES + 1))
fi
echo ""

echo "3️⃣  Verificando imports problemáticos em middleware..."
if grep -q "from ['\"]next/headers['\"]" middleware.ts 2>/dev/null; then
  echo -e "   ${RED}✗${NC} middleware.ts importa 'next/headers' (PROBLEMA!)"
  echo "      Use req.cookies e req.headers do NextRequest"
  ISSUES=$((ISSUES + 1))
else
  echo -e "   ${GREEN}✓${NC} Middleware não importa next/headers"
fi
echo ""

echo "4️⃣  Procurando chamadas top-level de APIs dinâmicas..."
TOPLEVEL_FOUND=false

# Procura por padrões de chamadas top-level
for file in $(find app lib -name "*.ts" -o -name "*.tsx" 2>/dev/null); do
  # Ignora node_modules
  if [[ $file == *"node_modules"* ]]; then
    continue
  fi

  # Verifica se tem import de APIs dinâmicas
  if grep -q "from ['\"]next/headers['\"]" "$file" || grep -q "from ['\"]next/navigation['\"]" "$file"; then
    # Procura por chamadas fora de funções (top-level)
    # Este é um check simples - pode ter falsos positivos
    if grep -B5 "cookies()\|headers()" "$file" | grep -q "^const\|^let\|^var" | grep -v "function\|=>\|async"; then
      echo -e "   ${YELLOW}⚠${NC}  Possível chamada top-level em: $file"
      TOPLEVEL_FOUND=true
    fi
  fi
done

if [ "$TOPLEVEL_FOUND" = false ]; then
  echo -e "   ${GREEN}✓${NC} Nenhuma chamada top-level óbvia encontrada"
else
  echo "   ${YELLOW}ℹ${NC}  Revise manualmente os arquivos acima"
fi
echo ""

echo "5️⃣  Verificando Server Actions..."
ACTIONS_OK=true
for file in $(find app lib -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -l "export.*async.*function" 2>/dev/null); do
  # Ignora node_modules
  if [[ $file == *"node_modules"* ]]; then
    continue
  fi

  # Verifica se tem "use server" se for uma action em app/
  if [[ $file == app/* ]] && grep -q "export.*async.*function" "$file"; then
    if ! grep -q '"use server"' "$file"; then
      echo -e "   ${YELLOW}⚠${NC}  Server Action sem 'use server': $file"
      ACTIONS_OK=false
    fi
  fi
done

if [ "$ACTIONS_OK" = true ]; then
  echo -e "   ${GREEN}✓${NC} Server Actions verificadas"
else
  echo "   ${YELLOW}ℹ${NC}  Algumas actions podem precisar de 'use server'"
fi
echo ""

echo "6️⃣  Verificando conflitos com 'use cache'..."
if grep -r '"use cache"' app lib --include="*.ts" --include="*.tsx" 2>/dev/null | grep -q "cookies\|headers"; then
  echo -e "   ${RED}✗${NC} 'use cache' usado com APIs dinâmicas (CONFLITO!)"
  ISSUES=$((ISSUES + 1))
else
  echo -e "   ${GREEN}✓${NC} Sem conflitos 'use cache' com APIs dinâmicas"
fi
echo ""

echo "7️⃣  Verificando runtime em route handlers..."
for file in $(find app -name "route.ts" -o -name "route.tsx" 2>/dev/null); do
  if grep -q "cookies()\|headers()" "$file"; then
    if ! grep -q 'runtime.*=.*"nodejs"' "$file"; then
      echo -e "   ${YELLOW}⚠${NC}  Route handler usa APIs dinâmicas sem runtime nodejs: $file"
    fi
  fi
done
echo -e "   ${GREEN}✓${NC} Route handlers verificados"
echo ""

echo "8️⃣  Verificando cache do Next.js..."
if [ -d ".next" ]; then
  echo -e "   ${YELLOW}ℹ${NC}  Cache .next existe ($(du -sh .next 2>/dev/null | cut -f1))"
  echo "      Se tiver problemas, rode: rm -rf .next"
else
  echo -e "   ${GREEN}✓${NC} Sem cache .next"
fi
echo ""

echo "================================================"
if [ $ISSUES -eq 0 ]; then
  echo -e "${GREEN}✅ Tudo OK! Nenhum problema detectado.${NC}"
else
  echo -e "${YELLOW}⚠️  $ISSUES problema(s) potencial(is) detectado(s).${NC}"
  echo "   Revise os itens marcados acima."
fi
echo "================================================"
echo ""
echo "Para mais detalhes, rode: bash diagnostics/collect-context.sh"
echo ""
